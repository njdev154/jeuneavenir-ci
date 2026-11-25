<?php

namespace App\Domain\Orientation;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;
use JsonException;
use RuntimeException;

class OrientationService
{
    private const QUESTION_COUNT = 7;

    private const RIASEC_LETTERS = ['R', 'I', 'A', 'S', 'E', 'C'];

    public function questionnaire(): array
    {
        $questions = $this->questions();
        if (count($questions) < self::QUESTION_COUNT) {
            throw new RuntimeException('La banque locale contient moins de sept questions.');
        }

        $selected = array_rand($questions, self::QUESTION_COUNT);
        $selected = is_array($selected) ? $selected : [$selected];
        $selectedQuestions = array_map(
            static fn (int $index): array => $questions[$index],
            $selected,
        );
        $questionIds = array_column($selectedQuestions, 'id');
        $token = Crypt::encryptString(json_encode([
            'version' => 1,
            'question_ids' => $questionIds,
            'questionnaire_fingerprint' => self::questionnaireFingerprint($selectedQuestions),
            'expires_at' => now()->addHour()->timestamp,
        ], JSON_THROW_ON_ERROR));

        return [
            'version' => 1,
            'question_count' => self::QUESTION_COUNT,
            'bank_size' => count($questions),
            'questionnaire_token' => $token,
            'series' => array_map(
                static fn (array $serie): array => [
                    'id' => $serie['id'],
                    'name' => $serie['nom'],
                    'verification' => $serie['verification'],
                ],
                $this->series(),
            ),
            'questions' => array_map(
                static fn (int $index): array => [
                    'id' => $questions[$index]['id'],
                    'text' => $questions[$index]['texte'],
                    'options' => array_map(
                        static fn (array $option): string => $option['texte'],
                        $questions[$index]['reponses'],
                    ),
                ],
                $selected,
            ),
        ];
    }

    public function calculate(array $input): array
    {
        $claims = $this->questionnaireClaims($input['questionnaire_token']);
        $questionsById = [];
        foreach ($this->questions() as $question) {
            $questionsById[$question['id']] = $question;
        }

        $selectedQuestions = array_map(
            static fn (string $questionId): array => $questionsById[$questionId],
            $claims['question_ids'],
        );
        if (! hash_equals(
            $claims['questionnaire_fingerprint'],
            self::questionnaireFingerprint($selectedQuestions),
        )) {
            throw ValidationException::withMessages([
                'questionnaire_token' => ['La banque de questions a changé depuis son chargement. Recommence le questionnaire.'],
            ]);
        }

        $seriesById = [];
        foreach ($this->series() as $serie) {
            $seriesById[$serie['id']] = $serie;
        }

        if (! isset($seriesById[$input['serie_id']])) {
            throw ValidationException::withMessages([
                'serie_id' => ['La série choisie ne figure pas dans le référentiel local.'],
            ]);
        }

        $answerIds = array_column($input['answers'], 'question_id');
        $questionIds = $claims['question_ids'];
        $sortedQuestionIds = $questionIds;
        $sortedAnswerIds = $answerIds;
        sort($sortedQuestionIds);
        sort($sortedAnswerIds);

        if ($sortedQuestionIds !== $sortedAnswerIds) {
            throw ValidationException::withMessages([
                'answers' => ['Chaque question sélectionnée doit avoir exactement une réponse.'],
            ]);
        }

        $scores = array_fill_keys(self::RIASEC_LETTERS, 0);
        $answers = [];

        foreach ($input['answers'] as $answer) {
            $question = $questionsById[$answer['question_id']] ?? null;
            $optionIndex = $answer['option_index'];
            $option = $question['reponses'][$optionIndex] ?? null;

            if ($question === null || $option === null) {
                throw ValidationException::withMessages([
                    'answers' => ['Une réponse ne correspond pas à la banque de questions actuelle.'],
                ]);
            }

            foreach ($option['riasec'] as $letter => $points) {
                if (array_key_exists($letter, $scores) && is_numeric($points)) {
                    $scores[$letter] += (int) $points;
                }
            }

            $answers[] = [
                'question_id' => $question['id'],
                'question' => $question['texte'],
                'answer' => $option['texte'],
            ];
        }

        arsort($scores);
        $profileLetters = array_slice(array_keys($scores), 0, 3);
        $serie = $seriesById[$input['serie_id']];
        $eligibleIds = $serie['filieres_possibles'];
        $fields = array_values(array_filter(
            $this->fields(),
            static fn (array $field): bool => in_array($field['id'], $eligibleIds, true),
        ));

        $ranked = array_map(
            static function (array $field) use ($profileLetters): array {
                $fieldCode = (string) ($field['code_holland'] ?? '');
                $overlap = count(array_filter(
                    $profileLetters,
                    static fn (string $letter): bool => str_contains($fieldCode, $letter),
                ));

                return ['field' => $field, 'overlap' => $overlap];
            },
            $fields,
        );

        usort($ranked, static fn (array $left, array $right): int => $right['overlap'] <=> $left['overlap']);
        $bestOverlap = $ranked[0]['overlap'] ?? -1;
        $mainTracks = [];
        $alternatives = [];

        foreach ($ranked as $item) {
            $track = self::publicField($item['field']);
            if ($item['overlap'] === $bestOverlap) {
                $mainTracks[] = $track;
            } else {
                $alternatives[] = $track;
            }
        }

        return [
            'version' => 1,
            'type' => 'piste_exploratoire',
            'stored' => false,
            'series' => [
                'id' => $serie['id'],
                'name' => $serie['nom'],
                'verification' => $serie['verification'],
            ],
            'main_tracks' => $mainTracks,
            'alternatives' => $alternatives,
            'answers' => $answers,
            'notice' => 'Résultat exploratoire calculé à partir du questionnaire actuel. Il ne constitue ni une affectation officielle, ni une prédiction d’admission. Aucune réponse n’est conservée par cette API.',
        ];
    }

    private function questionnaireClaims(string $token): array
    {
        try {
            $claims = json_decode(Crypt::decryptString($token), true, flags: JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException $exception) {
            throw ValidationException::withMessages([
                'questionnaire_token' => ['Ce questionnaire est invalide ou a été modifié. Recommence le parcours.'],
            ]);
        }

        if (! is_array($claims)
            || ($claims['version'] ?? null) !== 1
            || ! is_int($claims['expires_at'] ?? null)
            || $claims['expires_at'] <= now()->timestamp
            || ! is_string($claims['questionnaire_fingerprint'] ?? null)
            || preg_match('/\A[a-f0-9]{64}\z/', $claims['questionnaire_fingerprint']) !== 1
            || ! is_array($claims['question_ids'] ?? null)
            || count($claims['question_ids']) !== self::QUESTION_COUNT
            || count(array_unique($claims['question_ids'])) !== self::QUESTION_COUNT) {
            throw ValidationException::withMessages([
                'questionnaire_token' => ['Ce questionnaire a expiré ou n’est plus valide. Recommence le parcours.'],
            ]);
        }

        $knownIds = array_column($this->questions(), 'id');
        if (array_diff($claims['question_ids'], $knownIds) !== []) {
            throw ValidationException::withMessages([
                'questionnaire_token' => ['Les questions du questionnaire ne correspondent plus au référentiel. Recommence le parcours.'],
            ]);
        }

        return $claims;
    }

    private static function questionnaireFingerprint(array $questions): string
    {
        return hash(
            'sha256',
            json_encode($questions, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
        );
    }

    private function questions(): array
    {
        $data = $this->readJson('questions_path');

        if (! isset($data['questions']) || ! is_array($data['questions'])) {
            throw new RuntimeException('Le référentiel local de questions a un format invalide.');
        }

        return $data['questions'];
    }

    private function series(): array
    {
        $data = $this->readJson('series_path');

        if (! isset($data['series']) || ! is_array($data['series'])) {
            throw new RuntimeException('Le référentiel local des séries a un format invalide.');
        }

        return $data['series'];
    }

    private function fields(): array
    {
        $data = $this->readJson('fields_path');

        if (! isset($data['filieres']) || ! is_array($data['filieres'])) {
            throw new RuntimeException('Le référentiel local des filières a un format invalide.');
        }

        return $data['filieres'];
    }

    private function readJson(string $key): array
    {
        $path = config("orientation.{$key}");
        $contents = is_string($path) ? @file_get_contents($path) : false;

        if ($contents === false) {
            throw new RuntimeException("Le référentiel local « {$key} » est inaccessible.");
        }

        try {
            $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException("Le référentiel local « {$key} » contient un JSON invalide.", previous: $exception);
        }

        if (! is_array($data)) {
            throw new RuntimeException("Le référentiel local « {$key} » n’a pas la structure attendue.");
        }

        return $data;
    }

    private static function publicField(array $field): array
    {
        $public = [
            'description' => $field['description'] ?? null,
            'duration' => $field['duree_etudes'] ?? null,
            'main_subjects' => $field['matieres_principales'] ?? [],
            'outcomes' => $field['debouches'] ?? [],
        ];
        $missingData = [];

        foreach ($public as $name => $value) {
            if ($value === null || $value === '' || $value === []) {
                $missingData[] = $name;
            }
        }

        array_push($missingData, 'institutions', 'sources', 'verification');

        return [
            'id' => $field['id'],
            'name' => $field['nom'],
            ...$public,
            'verification' => 'non_renseignee',
            'missing_data' => $missingData,
        ];
    }
}
