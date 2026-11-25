<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OrientationApiTest extends TestCase
{
    public function test_questionnaire_returns_seven_public_questions_without_scoring_weights(): void
    {
        $response = $this->getJson('/api/v1/orientation/questionnaire');

        $response->assertOk()
            ->assertJsonPath('data.version', 1)
            ->assertJsonPath('data.question_count', 7)
            ->assertJsonPath('data.bank_size', 18)
            ->assertJsonCount(7, 'data.questions')
            ->assertJsonCount(18, 'data.series');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control', ''));

        foreach ($response->json('data.questions') as $question) {
            $this->assertArrayNotHasKey('riasec', $question);
            foreach ($question['options'] as $option) {
                $this->assertIsString($option);
            }
        }
    }

    public function test_result_returns_tied_tracks_unranked_alternatives_and_does_not_store_answers(): void
    {
        $questionnaire = $this->getJson('/api/v1/orientation/questionnaire')->assertOk()->json('data');
        $answers = array_map(
            static fn (array $question): array => [
                'question_id' => $question['id'],
                'option_index' => 0,
            ],
            $questionnaire['questions'],
        );

        DB::connection()->enableQueryLog();
        $response = $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'a1',
            'questionnaire_token' => $questionnaire['questionnaire_token'],
            'answers' => $answers,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.type', 'piste_exploratoire')
            ->assertJsonPath('data.stored', false)
            ->assertJsonCount(7, 'data.answers')
            ->assertJsonPath('data.series.id', 'a1')
            ->assertJsonPath('data.notice', 'Résultat exploratoire calculé à partir du questionnaire actuel. Il ne constitue ni une affectation officielle, ni une prédiction d’admission. Aucune réponse n’est conservée par cette API.');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control', ''));

        $data = $response->json('data');
        $this->assertNotEmpty($data['main_tracks']);
        $this->assertStringNotContainsString('%', json_encode($data, JSON_THROW_ON_ERROR));
        $this->assertArrayNotHasKey('scores', $data);
        $this->assertArrayNotHasKey('code', $data);
        $trackIds = array_merge(
            array_column($data['main_tracks'], 'id'),
            array_column($data['alternatives'], 'id'),
        );
        $this->assertCount(3, $trackIds);
        $this->assertCount(3, array_unique($trackIds));
        $this->assertSame([], DB::connection()->getQueryLog());
        $this->assertContains('institutions', $data['main_tracks'][0]['missing_data']);
        $this->assertContains('sources', $data['main_tracks'][0]['missing_data']);
        $this->assertContains('verification', $data['main_tracks'][0]['missing_data']);
    }

    public function test_result_rejects_repeated_questions_and_answers_for_a_different_selection(): void
    {
        $questionnaire = $this->getJson('/api/v1/orientation/questionnaire')->assertOk()->json('data');
        $questionIds = array_column($questionnaire['questions'], 'id');
        $answers = array_map(
            static fn (string $id): array => ['question_id' => $id, 'option_index' => 0],
            $questionIds,
        );

        $duplicateAnswers = $answers;
        $duplicateAnswers[1]['question_id'] = $duplicateAnswers[0]['question_id'];

        $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'd',
            'questionnaire_token' => $questionnaire['questionnaire_token'],
            'answers' => $duplicateAnswers,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['answers.1.question_id']);

        $differentAnswers = $answers;
        $differentAnswers[0]['question_id'] = 'unknown-question';
        $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'd',
            'questionnaire_token' => $questionnaire['questionnaire_token'],
            'answers' => $differentAnswers,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['answers']);
    }

    public function test_result_rejects_unknown_series_and_out_of_range_option(): void
    {
        $questionnaire = $this->getJson('/api/v1/orientation/questionnaire')->assertOk()->json('data');
        $answers = array_map(
            static fn (array $question): array => ['question_id' => $question['id'], 'option_index' => 0],
            $questionnaire['questions'],
        );

        $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'unknown',
            'questionnaire_token' => $questionnaire['questionnaire_token'],
            'answers' => $answers,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['serie_id']);

        $answers[0]['option_index'] = 999;
        $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'd',
            'questionnaire_token' => $questionnaire['questionnaire_token'],
            'answers' => $answers,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['answers']);
    }

    public function test_result_rejects_a_modified_questionnaire_token(): void
    {
        $questionnaire = $this->getJson('/api/v1/orientation/questionnaire')->assertOk()->json('data');
        $answers = array_map(
            static fn (array $question): array => ['question_id' => $question['id'], 'option_index' => 0],
            $questionnaire['questions'],
        );

        $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'd',
            'questionnaire_token' => $questionnaire['questionnaire_token'].'tampered',
            'answers' => $answers,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['questionnaire_token']);
    }

    public function test_result_rejects_a_question_bank_change_after_loading_the_questionnaire(): void
    {
        $source = file_get_contents(config('orientation.questions_path'));
        $this->assertIsString($source);
        $temporaryPath = tempnam(sys_get_temp_dir(), 'ja-questions-');
        $this->assertNotFalse($temporaryPath);

        try {
            file_put_contents($temporaryPath, $source);
            config(['orientation.questions_path' => $temporaryPath]);

            $questionnaire = $this->getJson('/api/v1/orientation/questionnaire')
                ->assertOk()
                ->json('data');
            $bank = json_decode($source, true, flags: JSON_THROW_ON_ERROR);
            $selectedIds = array_column($questionnaire['questions'], 'id');
            $changed = false;

            foreach ($bank['questions'] as $index => $question) {
                if (in_array($question['id'], $selectedIds, true)) {
                    $bank['questions'][$index]['texte'] .= ' (modifiée)';
                    $changed = true;
                    break;
                }
            }

            $this->assertTrue($changed);
            file_put_contents(
                $temporaryPath,
                json_encode($bank, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
            );

            $answers = array_map(
                static fn (array $question): array => [
                    'question_id' => $question['id'],
                    'option_index' => 0,
                ],
                $questionnaire['questions'],
            );

            $this->postJson('/api/v1/orientation/results', [
                'serie_id' => 'a1',
                'questionnaire_token' => $questionnaire['questionnaire_token'],
                'answers' => $answers,
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['questionnaire_token']);
        } finally {
            unlink($temporaryPath);
        }
    }

    public function test_result_rejects_free_text_and_unsupported_fields(): void
    {
        $questionnaire = $this->getJson('/api/v1/orientation/questionnaire')->assertOk()->json('data');
        $answers = array_map(
            static fn (array $question): array => ['question_id' => $question['id'], 'option_index' => 0],
            $questionnaire['questions'],
        );

        $this->postJson('/api/v1/orientation/results', [
            'serie_id' => 'd',
            'questionnaire_token' => $questionnaire['questionnaire_token'],
            'answers' => $answers,
            'free_text' => 'Je préfère le développement web.',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['request']);
    }
}
