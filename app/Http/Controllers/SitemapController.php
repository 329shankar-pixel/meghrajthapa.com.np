<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Event;
use App\Models\Leader;
use App\Models\News;
use App\Models\Post;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $urls = [];

        // Static Pages
        $urls[] = [
            'loc' => route('home'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '1.0',
        ];

        $urls[] = [
            'loc' => route('public.biography'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.8',
        ];

        $urls[] = [
            'loc' => route('public.news'),
            'lastmod' => News::latest('updated_at')->first()?->updated_at?->toAtomString() ?? now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '0.9',
        ];

        $urls[] = [
            'loc' => route('public.blog'),
            'lastmod' => Post::latest('updated_at')->where('is_published', true)->first()?->updated_at?->toAtomString() ?? now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '0.9',
        ];

        $urls[] = [
            'loc' => route('public.events'),
            'lastmod' => Event::latest('updated_at')->first()?->updated_at?->toAtomString() ?? now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '0.9',
        ];

        $urls[] = [
            'loc' => route('public.activities'),
            'lastmod' => Activity::latest('updated_at')->first()?->updated_at?->toAtomString() ?? now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '0.9',
        ];

        $urls[] = [
            'loc' => route('public.galleries'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.7',
        ];

        $urls[] = [
            'loc' => route('public.infographics'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.7',
        ];

        $urls[] = [
            'loc' => route('public.videos'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.7',
        ];

        $urls[] = [
            'loc' => route('public.resources'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.6',
        ];

        $urls[] = [
            'loc' => route('join.index'),
            'lastmod' => now()->startOfMonth()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.8',
        ];

        // Leaders
        foreach (Leader::all() as $leader) {
            $urls[] = [
                'loc' => route('leader.show', $leader->slug),
                'lastmod' => $leader->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.9',
            ];
        }

        // Dynamic Pages - News
        foreach (News::where('is_published', true)->get() as $news) {
            $urls[] = [
                'loc' => route('public.news.show', $news->slug),
                'lastmod' => $news->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ];
        }

        // Dynamic Pages - Blog Posts
        foreach (Post::where('is_published', true)->get() as $post) {
            $urls[] = [
                'loc' => route('public.blog.show', $post->slug),
                'lastmod' => $post->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ];
        }

        // Dynamic Pages - Events
        foreach (Event::all() as $event) {
            $urls[] = [
                'loc' => route('public.events.show', $event),
                'lastmod' => $event->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.7',
            ];
        }

        // Dynamic Pages - Activities
        foreach (Activity::all() as $activity) {
            $urls[] = [
                'loc' => route('public.activities.show', $activity->slug),
                'lastmod' => $activity->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.7',
            ];
        }

        return response()->view('sitemap', [
            'urls' => $urls,
        ])->header('Content-Type', 'text/xml');
    }
}
