<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PublicSiteController extends Controller
{
    private const PUBLIC_DIRECTORIES = ['assets', 'css', 'data', 'js'];

    private const PUBLIC_EXTENSIONS = [
        'assets' => ['gif', 'ico', 'jpeg', 'jpg', 'png', 'svg', 'ttf', 'webp', 'woff', 'woff2'],
        'css' => ['css'],
        'data' => ['json'],
        'js' => ['js'],
    ];

    private const CONTENT_TYPES = [
        'css' => 'text/css; charset=UTF-8',
        'gif' => 'image/gif',
        'html' => 'text/html; charset=UTF-8',
        'ico' => 'image/vnd.microsoft.icon',
        'jpeg' => 'image/jpeg',
        'jpg' => 'image/jpeg',
        'js' => 'text/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'png' => 'image/png',
        'svg' => 'image/svg+xml',
        'ttf' => 'font/ttf',
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
    ];

    public function home(): BinaryFileResponse
    {
        return $this->serve('index.html');
    }

    public function dashboard(): BinaryFileResponse|RedirectResponse
    {
        if (
            config('accounts.enabled')
            && app()->environment(['local', 'testing'])
            && ! Auth::check()
        ) {
            return redirect('/connexion.html');
        }

        return $this->serve('dashboard.html');
    }

    public function show(string $path): BinaryFileResponse
    {
        return $this->serve($path);
    }

    private function serve(string $path): BinaryFileResponse
    {
        $normalized = str_replace('\\', '/', rawurldecode($path));
        $segments = explode('/', $normalized);
        $root = realpath(dirname(base_path()));

        if (
            $root === false
            || $normalized === ''
            || str_contains($normalized, "\0")
            || str_starts_with($normalized, '/')
            || in_array('..', $segments, true)
            || in_array('.', $segments, true)
        ) {
            throw new NotFoundHttpException();
        }

        if (count($segments) === 1) {
            if (strtolower(pathinfo($normalized, PATHINFO_EXTENSION)) !== 'html') {
                throw new NotFoundHttpException();
            }
        } elseif (
            ! in_array($segments[0], self::PUBLIC_DIRECTORIES, true)
            || ! in_array(
                strtolower(pathinfo($normalized, PATHINFO_EXTENSION)),
                self::PUBLIC_EXTENSIONS[$segments[0]],
                true
            )
        ) {
            throw new NotFoundHttpException();
        }

        $allowedRoot = count($segments) === 1
            ? $root
            : realpath($root.DIRECTORY_SEPARATOR.$segments[0]);
        $file = realpath($root.DIRECTORY_SEPARATOR.implode(DIRECTORY_SEPARATOR, $segments));
        $rootPrefix = rtrim($root, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
        $allowedPrefix = $allowedRoot === false
            ? ''
            : rtrim($allowedRoot, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
        $insideAllowedRoot = $file !== false && (
            count($segments) === 1
                ? dirname($file) === $root
                : str_starts_with(strtolower($file), strtolower($allowedPrefix))
        );

        if (
            $file === false
            || $allowedRoot === false
            || ! is_file($file)
            || ! str_starts_with(strtolower($file), strtolower($rootPrefix))
            || ! $insideAllowedRoot
        ) {
            throw new NotFoundHttpException();
        }

        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        return response()->file($file, [
            'Cache-Control' => 'no-store',
            'Content-Type' => self::CONTENT_TYPES[$extension],
        ]);
    }
}
