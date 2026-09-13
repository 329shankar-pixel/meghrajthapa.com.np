<?php

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    $this->actingAs($this->user);
});

it('can list events', function () {
    Event::factory()->count(3)->create();

    $response = $this->get(route('events.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/index')
        ->has('events.data', 3)
    );
});

it('can show create event page', function () {
    $response = $this->get(route('events.create'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/create')
    );
});

it('can store an event', function () {
    $eventData = [
        'title' => 'Sample Event',
        'content' => 'Sample content',
        'event_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'location' => 'Sample Location',
    ];

    $response = $this->post(route('events.store'), $eventData);

    $response->assertRedirect(route('events.index'));
    $this->assertDatabaseHas('events', [
        'title' => 'Sample Event',
        'slug' => 'sample-event',
    ]);
});

it('can auto-generate slug on store', function () {
    $eventData = [
        'title' => 'My New Event',
        'event_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
    ];

    $this->post(route('events.store'), $eventData);

    $this->assertDatabaseHas('events', [
        'title' => 'My New Event',
        'slug' => 'my-new-event',
    ]);
});

it('can show an event', function () {
    $event = Event::factory()->create();

    $response = $this->get(route('events.show', $event));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/show')
        ->has('event')
        ->where('event.id', $event->id)
    );
});

it('can show edit event page', function () {
    $event = Event::factory()->create();

    $response = $this->get(route('events.edit', $event));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/edit')
        ->has('event')
        ->where('event.id', $event->id)
    );
});

it('can update an event', function () {
    $event = Event::factory()->create(['title' => 'Old Title']);

    $response = $this->put(route('events.update', $event), [
        'title' => 'New Title',
        'event_date' => now()->addDays(3)->format('Y-m-d H:i:s'),
    ]);

    $response->assertRedirect(route('events.index'));
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'title' => 'New Title',
    ]);
});

it('can delete an event', function () {
    $event = Event::factory()->create();

    $response = $this->delete(route('events.destroy', $event));

    $response->assertRedirect(route('events.index'));
    $this->assertDatabaseMissing('events', ['id' => $event->id]);
});
