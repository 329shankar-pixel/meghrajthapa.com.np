<?php

use App\Models\Leader;
use App\Models\LeaderTimeline;
use App\Models\News;
use App\Models\TeamMember;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('displays the public homepage', function () {
    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('public/index'));
});

it('displays leader data on homepage', function () {
    $leader = Leader::factory()->create([
        'name' => 'Test Leader',
        'bio' => 'Test biography content',
    ]);

    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) =>
        $page->component('public/index')
            ->has('leader')
            ->where('leader.name', 'Test Leader')
    );
});

it('displays timeline events on homepage', function () {
    $leader = Leader::factory()->create();
    LeaderTimeline::factory()->count(3)->create([
        'leader_id' => $leader->id,
    ]);

    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) =>
        $page->component('public/index')
            ->has('timelines', 3)
    );
});

it('can submit join team form', function () {
    $response = $this->post('/join-team', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '9841234567',
        'address' => 'Kathmandu, Nepal',
        'message' => 'I want to join the party.',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('team_members', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '9841234567',
    ]);
});

it('validates join team form requires full name', function () {
    $response = $this->post('/join-team', [
        'email' => 'john@example.com',
        'phone' => '9841234567',
    ]);

    $response->assertSessionHasErrors(['full_name']);
});

it('validates join team form requires email', function () {
    $response = $this->post('/join-team', [
        'full_name' => 'John Doe',
        'phone' => '9841234567',
    ]);

    $response->assertSessionHasErrors(['email']);
});

it('validates join team form requires phone', function () {
    $response = $this->post('/join-team', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response->assertSessionHasErrors(['phone']);
});

it('validates join team form email format', function () {
    $response = $this->post('/join-team', [
        'full_name' => 'John Doe',
        'email' => 'invalid-email',
        'phone' => '9841234567',
    ]);

    $response->assertSessionHasErrors(['email']);
});
