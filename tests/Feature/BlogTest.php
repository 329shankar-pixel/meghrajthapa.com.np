<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can view blog index', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get('/blog');

    $response->assertStatus(200);
});

test('authenticated user can create a blog post', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post('/blog', [
        'title' => 'Test Blog Post',
        'content' => 'This is a test blog post content that is long enough.',
        'excerpt' => 'Short summary',
        'is_published' => true,
    ]);

    $response->assertRedirect('/blog');
    $this->assertDatabaseHas('posts', [
        'title' => 'Test Blog Post',
        'slug' => 'test-blog-post',
        'user_id' => $user->id,
    ]);
});

test('authenticated user can update a blog post', function () {
    $user = User::factory()->admin()->create();
    $post = Post::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->put("/blog/{$post->id}", [
        'title' => 'Updated Title',
        'slug' => 'updated-title',
        'content' => 'Updated content.',
        'excerpt' => 'Updated excerpt',
        'is_published' => false,
    ]);

    $response->assertRedirect('/blog');
    $this->assertDatabaseHas('posts', [
        'id' => $post->id,
        'title' => 'Updated Title',
        'slug' => 'updated-title',
    ]);
});

test('authenticated user can delete a blog post', function () {
    $user = User::factory()->admin()->create();
    $post = Post::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->delete("/blog/{$post->id}");

    $response->assertRedirect('/blog');
    $this->assertDatabaseMissing('posts', [
        'id' => $post->id,
    ]);
});
