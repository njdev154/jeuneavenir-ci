<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Tests\TestCase;

class LocalAccountAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['accounts.enabled' => true]);
    }

    public function test_status_exposes_csrf_only_when_local_accounts_are_enabled(): void
    {
        $this->getJson('/auth/status')
            ->assertOk()
            ->assertJsonPath('data.enabled', true)
            ->assertJsonStructure(['data' => ['csrf_token']]);

        config(['accounts.enabled' => false]);
        $this->getJson('/auth/status')
            ->assertOk()
            ->assertJsonPath('data.enabled', false)
            ->assertJsonPath('data.csrf_token', null);
    }

    public function test_registration_creates_a_local_youth_account_and_starts_a_session(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => '  Awa Koné  ',
            'email' => ' AWA@example.ci ',
            'password' => 'UnePhraseTresSure2026',
            'password_confirmation' => 'UnePhraseTresSure2026',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.name', 'Awa Koné')
            ->assertJsonPath('data.user.email', 'awa@example.ci')
            ->assertJsonPath('data.user.role', 'jeune')
            ->assertJsonMissingPath('data.user.password');

        $this->assertDatabaseHas('users', [
            'name' => 'Awa Koné',
            'email' => 'awa@example.ci',
            'role' => 'jeune',
        ]);

        $user = User::where('email', 'awa@example.ci')->firstOrFail();
        $this->assertTrue(Hash::check('UnePhraseTresSure2026', $user->password));
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_rejects_privileged_role_assignment_and_weak_passwords(): void
    {
        $this->postJson('/auth/register', [
            'name' => 'Awa Koné',
            'email' => 'awa@example.ci',
            'password' => 'UnePhraseTresSure2026',
            'password_confirmation' => 'UnePhraseTresSure2026',
            'role' => 'admin',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);

        $this->postJson('/auth/register', [
            'name' => 'Awa Koné',
            'email' => 'awa@example.ci',
            'password' => 'court',
            'password_confirmation' => 'court',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_login_checks_credentials_and_logout_invalidates_the_session(): void
    {
        $user = User::create([
            'name' => 'Awa Koné',
            'email' => 'awa@example.ci',
            'password' => 'UnePhraseTresSure2026',
        ]);

        $this->postJson('/auth/login', [
            'email' => 'AWA@example.ci',
            'password' => 'incorrect',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
        $this->assertGuest();

        $this->postJson('/auth/login', [
            'email' => 'AWA@example.ci',
            'password' => 'UnePhraseTresSure2026',
        ])->assertOk()
            ->assertJsonPath('data.user.id', $user->id);
        $this->assertAuthenticatedAs($user);

        $this->getJson('/auth/current')->assertOk()
            ->assertJsonPath('data.user.email', 'awa@example.ci');

        $this->postJson('/auth/logout')->assertOk();
        $this->assertGuest();
        $this->getJson('/auth/current')->assertUnauthorized();
    }

    public function test_account_routes_are_closed_when_disabled_or_outside_local_environments(): void
    {
        config(['accounts.enabled' => false]);
        $this->postJson('/auth/register')->assertNotFound();

        config(['accounts.enabled' => true]);
        $this->app->detectEnvironment(fn (): string => 'production');
        $this->getJson('/auth/current')->assertNotFound();
        $this->postJson('/auth/register')->assertStatus(419);
    }

    public function test_dashboard_redirects_guests_and_serves_the_page_to_a_local_session(): void
    {
        $this->get('/dashboard.html')->assertRedirect('/connexion.html');

        $user = User::create([
            'name' => 'Awa Koné',
            'email' => 'awa@example.ci',
            'password' => 'UnePhraseTresSure2026',
        ]);

        $response = $this->actingAs($user)->get('/dashboard.html');
        $response->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
        $this->assertInstanceOf(BinaryFileResponse::class, $response->baseResponse);
    }
}
