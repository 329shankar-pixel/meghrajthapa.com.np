<?php

use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    Storage::fake('public');
});

it('can list activities', function () {
    Activity::factory()->count(3)->create();

    actingAs($this->user)
        ->get('/activities')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('activities/index')
            ->has('activities.data', 3)
        );
});

it('can show create activity page', function () {
    actingAs($this->user)
        ->get('/activities/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('activities/create')
        );
});

it('can store an activity with photos', function () {
    $activityData = [
        'title' => 'Test Activity',
        'slug' => 'test-activity',
        'description' => 'Test description',
        'photos' => [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg'),
        ],
    ];

    actingAs($this->user)
        ->post('/activities', $activityData)
        ->assertRedirect('/activities');

    $this->assertDatabaseHas('activities', [
        'title' => 'Test Activity',
        'slug' => 'test-activity',
    ]);

    $activity = Activity::where('slug', 'test-activity')->first();
    expect($activity->photos)->toHaveCount(2);

    foreach ($activity->photos as $photo) {
        Storage::disk('public')->assertExists($photo->photo_path);
    }
});

it('can show edit activity page', function () {
    $activity = Activity::factory()->create();

    actingAs($this->user)
        ->get("/activities/{$activity->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('activities/edit')
            ->has('activity', fn ($json) => $json
                ->where('id', $activity->id)
                ->where('title', $activity->title)
                ->etc()
            )
        );
});

it('can update an activity and add more photos', function () {
    $activity = Activity::factory()->create();
    $photo = $activity->photos()->create(['photo_path' => 'existing.jpg']);

    $updatedData = [
        '_method' => 'PUT',
        'title' => 'Updated Activity',
        'slug' => 'updated-activity',
        'description' => 'Updated description',
        'photos' => [
            UploadedFile::fake()->image('new_photo.jpg'),
        ],
    ];

    actingAs($this->user)
        ->post("/activities/{$activity->id}", $updatedData)
        ->assertRedirect('/activities');

    $activity->refresh();
    expect($activity->title)->toBe('Updated Activity');
    expect($activity->photos)->toHaveCount(2);
});

it('can delete an activity and its photos', function () {
    $activity = Activity::factory()->create();
    $photo = $activity->photos()->create(['photo_path' => 'to_be_deleted.jpg']);
    Storage::disk('public')->put('to_be_deleted.jpg', 'content');

    actingAs($this->user)
        ->delete("/activities/{$activity->id}")
        ->assertRedirect('/activities');

    $this->assertDatabaseMissing('activities', ['id' => $activity->id]);
    $this->assertDatabaseMissing('activity_photos', ['id' => $photo->id]);
    Storage::disk('public')->assertMissing('to_be_deleted.jpg');
});

it('can delete a specific photo from an activity', function () {
    $activity = Activity::factory()->create();
    $photo = $activity->photos()->create(['photo_path' => 'delete_me.jpg']);
    Storage::disk('public')->put('delete_me.jpg', 'content');

    actingAs($this->user)
        ->delete("/activity-photos/{$photo->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('activity_photos', ['id' => $photo->id]);
    Storage::disk('public')->assertMissing('delete_me.jpg');
});

it('automatically generates slug if not provided', function () {
    $activityData = [
        'title' => 'Auto Generated Slug Test',
        'description' => 'Test description',
    ];

    actingAs($this->user)
        ->post('/activities', $activityData)
        ->assertRedirect('/activities');

    $this->assertDatabaseHas('activities', [
        'title' => 'Auto Generated Slug Test',
        'slug' => 'auto-generated-slug-test',
    ]);
});

it('requires title to create activity', function () {
    actingAs($this->user)
        ->post('/activities', [])
        ->assertSessionHasErrors(['title']);
});
