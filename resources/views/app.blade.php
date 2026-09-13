<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @php
            $partyName = \App\Models\Setting::get('party_name', config('app.name', 'Nepali Congress Campaign'));
            $tagline = \App\Models\Setting::get('site_tagline', 'Movement for Progress');
            $favicon = \App\Models\Setting::get('favicon');
            $siteLogo = \App\Models\Setting::get('site_logo') ?: \App\Models\Setting::get('party_flag');
            $brandImage = $favicon ?: $siteLogo;
            $faviconPath = $brandImage ? asset('storage/' . $brandImage) : asset('logo.svg');
            $description = "Welcome to $partyName - $tagline. Working towards a prosperous nation.";
        @endphp

        <title inertia>{{ $partyName }}</title>

        <!-- SEO & Social Media Preview -->
        <meta name="description" content="{{ $description }}">
        <meta property="og:title" content="{{ $partyName }}">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:image" content="{{ $faviconPath }}">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $partyName }}">
        <meta name="twitter:description" content="{{ $description }}">
        <meta name="twitter:image" content="{{ $faviconPath }}">

        <link rel="icon" href="{{ $faviconPath }}" sizes="any">
        <link rel="apple-touch-icon" href="{{ $faviconPath }}">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
