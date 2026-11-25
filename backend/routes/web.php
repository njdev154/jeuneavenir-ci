<?php

use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\Auth\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/status', [SessionController::class, 'status']);
Route::post('/auth/register', [SessionController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [SessionController::class, 'login'])->middleware('throttle:5,1');
Route::middleware('throttle:30,1')->group(function (): void {
    Route::get('/auth/current', [SessionController::class, 'current']);
    Route::post('/auth/logout', [SessionController::class, 'logout']);
});

Route::get('/', [PublicSiteController::class, 'home']);
Route::get('/dashboard.html', [PublicSiteController::class, 'dashboard']);
Route::get('/{path}', [PublicSiteController::class, 'show'])
    ->where('path', '(?!api(?:/|$)).*');
