<?php

use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
});

it('can list news articles', function () {
    News::factory()->count(3)->create();

    actingAs($this->user)
        ->get('/news')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news/index')
            ->has('news.data', 3)
        );
});

it('can show create news page', function () {
    actingAs($this->user)
        ->get('/news/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news/create')
        );
});

it('can store a news article', function () {
    $newsData = [
        'title' => 'Test News Title',
        'slug' => 'test-news-title',
        'content' => '<p>Test content here.</p>',
        'meta_title' => 'Meta Title',
        'is_published' => true,
    ];

    actingAs($this->user)
        ->post('/news', $newsData)
        ->assertRedirect('/news');

    $this->assertDatabaseHas('news', [
        'title' => 'Test News Title',
        'slug' => 'test-news-title',
    ]);
});

it('can show edit news page', function () {
    $news = News::factory()->create();

    actingAs($this->user)
        ->get("/news/{$news->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news/edit')
            ->has('news', fn ($json) => $json
                ->where('id', $news->id)
                ->where('title', $news->title)
                ->etc()
            )
        );
});

it('can update a news article', function () {
    $news = News::factory()->create();
    $updatedData = [
        'title' => 'Updated News Title',
        'slug' => 'updated-news-title',
        'content' => '<p>Updated content.</p>',
        'is_published' => false,
    ];

    actingAs($this->user)
        ->post("/news/{$news->id}", array_merge($updatedData, ['_method' => 'PUT']))
        ->assertRedirect('/news');

    $this->assertDatabaseHas('news', [
        'id' => $news->id,
        'title' => 'Updated News Title',
    ]);
});

it('can delete a news article', function () {
    $news = News::factory()->create();

    actingAs($this->user)
        ->delete("/news/{$news->id}")
        ->assertRedirect('/news');

    $this->assertDatabaseMissing('news', ['id' => $news->id]);
});

it('automatically generates slug if not provided', function () {
    $newsData = [
        'title' => 'Auto Generated News Slug',
        'content' => '<p>Test content.</p>',
    ];

    actingAs($this->user)
        ->post('/news', $newsData)
        ->assertRedirect('/news');

    $this->assertDatabaseHas('news', [
        'title' => 'Auto Generated News Slug',
        'slug' => 'auto-generated-news-slug',
    ]);
});

it('requires title and content to create news', function () {
    actingAs($this->user)
        ->post('/news', [])
        ->assertSessionHasErrors(['title', 'content']);
});
