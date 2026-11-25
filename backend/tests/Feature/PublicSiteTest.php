<?php

namespace Tests\Feature;

use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Tests\TestCase;

class PublicSiteTest extends TestCase
{
    public function test_root_and_frontend_pages_are_served_from_the_project_site(): void
    {
        $home = $this->get('/');
        $home
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
        $this->assertFileResponseContains($home, 'JeuneAvenir CI');
        $this->assertFileResponseContains($home, 'href="quiz.html"');

        $quiz = $this->get('/quiz.html');
        $quiz
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
        $this->assertFileResponseContains($quiz, 'Avant de commencer');

        $styles = $this->get('/css/orientation.css');
        $styles
            ->assertOk()
            ->assertHeader('content-type', 'text/css; charset=UTF-8');
        $this->assertFileResponseContains($styles, '.orientation-profil-champs');
    }

    public function test_only_public_frontend_assets_are_served(): void
    {
        $this->get('/backend/.env')->assertNotFound();
        $this->get('/docs/conception/08-modele-de-donnees.md')->assertNotFound();
        $this->get('/composer.json')->assertNotFound();
    }

    public function test_orientation_api_remains_available_beside_the_frontend_fallback(): void
    {
        $this->getJson('/api/v1/orientation/questionnaire')
            ->assertOk()
            ->assertJsonCount(7, 'data.questions');
    }

    private function assertFileResponseContains(TestResponse $response, string $expected): void
    {
        $this->assertInstanceOf(BinaryFileResponse::class, $response->baseResponse);

        $contents = file_get_contents($response->baseResponse->getFile()->getPathname());
        $this->assertNotFalse($contents);
        $this->assertStringContainsString($expected, $contents);
    }
}
