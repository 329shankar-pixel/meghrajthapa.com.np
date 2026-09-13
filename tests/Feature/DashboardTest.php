<?php

namespace Tests\Feature;

use App\Models\Action;
use App\Models\Activity;
use App\Models\Event;
use App\Models\News;
use App\Models\PartyMember;
use App\Models\PartyMemberType;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_displays_stats()
    {
        $user = User::factory()->admin()->create();
        
        // Create known quantities of data
        $types = PartyMemberType::factory()->count(2)->create();
        PartyMember::factory()->count(3)->create([
            'party_member_type_id' => $types->first()->id
        ]);
        Event::factory()->count(4)->create();
        $event = Event::first();
        Volunteer::factory()->count(5)->create(['event_id' => $event->id]);
        Activity::factory()->count(1)->create();
        News::factory()->count(2)->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('stats', fn (Assert $json) => $json
                ->where('partyMembers', 3)
                ->where('partyMemberTypes', 2)
                ->where('events', 4)
                ->where('volunteers', 5)
                ->where('activities', 1)
                ->where('news', 2)
            )
            ->has('recentMembers')
        );
    }
}
