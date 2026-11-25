<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Orientation\OrientationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrientationController extends Controller
{
    public function __construct(private readonly OrientationService $orientation) {}

    public function questionnaire(): JsonResponse
    {
        return response()->json(['data' => $this->orientation->questionnaire()])
            ->header('Cache-Control', 'no-store');
    }

    public function result(Request $request): JsonResponse
    {
        if (array_diff(array_keys($request->all()), ['serie_id', 'questionnaire_token', 'answers']) !== []) {
            throw ValidationException::withMessages([
                'request' => ['Cette API n’accepte que la série, le jeton du questionnaire et les réponses indexées. Le texte libre et les autres champs ne sont pas pris en charge.'],
            ]);
        }

        $input = $request->validate([
            'serie_id' => ['required', 'string', 'max:64'],
            'questionnaire_token' => ['required', 'string', 'max:8192'],
            'answers' => ['required', 'array', 'size:7'],
            'answers.*' => ['required', 'array:question_id,option_index'],
            'answers.*.question_id' => ['required', 'string', 'distinct'],
            'answers.*.option_index' => ['required', 'integer', 'min:0'],
        ]);

        return response()->json(['data' => $this->orientation->calculate($input)])
            ->header('Cache-Control', 'no-store');
    }
}
