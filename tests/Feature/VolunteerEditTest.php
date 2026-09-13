<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VolunteerEditTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_edit_volunteer_page()
    {
        $user = User::factory()->admin()->create();
        $event = Event::factory()->create();
        $volunteer = Volunteer::factory()->create(['event_id' => $event->id]);

        $response = $this->actingAs($user)->get(route('volunteers.edit', $volunteer));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('volunteers/edit')
            ->has('volunteer')
            ->has('provinces')
        );
    }

    public function test_can_update_volunteer()
    {
        $user = User::factory()->admin()->create();
        $event = Event::factory()->create();
        $volunteer = Volunteer::factory()->create(['event_id' => $event->id]);

        $updatedData = [
            'event_id' => $event->id,
            'full_name' => 'Updated Name',
            'phone' => '9800000000',
            'email' => 'updated@example.com',
            'province_id' => 1,
            'district_id' => 1,
            'municipality_id' => 1,
            'ward_number' => 2,
        ];

        $response = $this->actingAs($user)->put(route('volunteers.update', $volunteer), $updatedData);

        $response->assertRedirect(route('events.show', $event->id));
        $this->assertDatabaseHas('volunteers', [
            'id' => $volunteer->id,
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
    }
}
