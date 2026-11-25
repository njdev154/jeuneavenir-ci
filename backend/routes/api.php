<?php

use App\Http\Controllers\Api\V1\OrientationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/orientation/questionnaire', [OrientationController::class, 'questionnaire'])->middleware('throttle:30,1');
    Route::post('/orientation/results', [OrientationController::class, 'result'])->middleware('throttle:30,1');
});
