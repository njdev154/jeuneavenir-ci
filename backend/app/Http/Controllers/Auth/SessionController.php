<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class SessionController extends Controller
{
    public function status(): JsonResponse
    {
        $enabled = config('accounts.enabled') && app()->environment(['local', 'testing']);

        return response()->json([
            'data' => [
                'enabled' => $enabled,
                'csrf_token' => $enabled ? csrf_token() : null,
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $this->ensureLocalAccountsEnabled();
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:254', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'role' => ['prohibited'],
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);
        $user->forceFill(['role' => 'jeune'])->save();

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'data' => ['user' => $this->userPayload($user)],
        ], Response::HTTP_CREATED);
    }

    public function login(Request $request): JsonResponse
    {
        $this->ensureLocalAccountsEnabled();
        $this->normalizeEmail($request);

        $credentials = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'password' => ['required', 'string', 'max:200'],
        ]);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Adresse e-mail ou mot de passe invalide.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'data' => ['user' => $this->userPayload($request->user())],
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $this->ensureLocalAccountsEnabled();

        if (! $request->user()) {
            return response()->json(['message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json([
            'data' => ['user' => $this->userPayload($request->user())],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->ensureLocalAccountsEnabled();
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Session fermée.']);
    }

    private function ensureLocalAccountsEnabled(): void
    {
        abort_unless(
            config('accounts.enabled') && app()->environment(['local', 'testing']),
            Response::HTTP_NOT_FOUND,
        );
    }

    private function normalizeEmail(Request $request): void
    {
        $email = $request->input('email');

        if (is_string($email)) {
            $request->merge(['email' => strtolower(trim($email))]);
        }
    }

    /**
     * @return array{id: int, name: string, email: string, role: string}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}
