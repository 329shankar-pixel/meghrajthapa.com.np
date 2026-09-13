<?php

use App\Models\Event;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    $this->actingAs($this->user);
});

it('can show create volunteer page', function () {
    $event = Event::factory()->create();

    $response = $this->get(route('volunteers.create', ['event_id' => $event->id]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('volunteers/create')
        ->has('event')
        ->where('event.id', $event->id)
        ->has('provinces')
    );
});

it('can store a volunteer', function () {
    $event = Event::factory()->create();
    $volunteerData = [
        'event_id' => $event->id,
        'full_name' => 'John Doe',
        'phone' => '9876543210',
        'email' => 'john@example.com',
        'province_id' => 1,
        'district_id' => 1,
        'municipality_id' => 1,
        'ward_number' => 1,
    ];

    $response = $this->post(route('volunteers.store'), $volunteerData);

    $response->assertRedirect(route('events.show', $event->id));
    $this->assertDatabaseHas('volunteers', [
        'full_name' => 'John Doe',
        'event_id' => $event->id,
    ]);
});

it('can delete a volunteer', function () {
    $volunteer = Volunteer::factory()->create();
    $eventId = $volunteer->event_id;

    $response = $this->delete(route('volunteers.destroy', $volunteer));

    $response->assertRedirect(route('events.show', $eventId));
    $this->assertDatabaseMissing('volunteers', ['id' => $volunteer->id]);
});
