<?php

namespace Tests\Feature;

use App\Models\Leader;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LeaderTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_leader_profile_edit()
    {
        $user = User::factory()->admin()->create();
        Leader::create([
            'name' => 'John Doe',
            'slug' => 'john-doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'bio' => 'A great leader',
            'social_links' => ['facebook' => 'https://facebook.com'],
        ]);

        $response = $this->actingAs($user)->get(route('leader.profile'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('leaders/profile')
            ->where('leader.name', 'John Doe')
            ->where('leader.email', 'john@example.com')
        );
    }

    public function test_admin_can_view_leader_biography_edit()
    {
        $user = User::factory()->admin()->create();
        Leader::create([
            'name' => 'John Doe',
            'slug' => 'john-doe',
            'bio' => 'Original bio'
        ]);

        $response = $this->actingAs($user)->get(route('leader.biography'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('leaders/biography')
            ->where('leader.bio', 'Original bio')
        );
    }

    public function test_admin_can_create_leader()
    {
        $user = User::factory()->admin()->create();
        
        $response = $this->actingAs($user)->post(route('leader.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '0987654321',
            'bio' => 'Another leader',
            'social_links' => ['twitter' => 'https://twitter.com'],
        ]);

        $response->assertRedirect(route('leader.biography'));
        $this->assertDatabaseHas('leaders', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '0987654321',
            'slug' => 'jane-doe',
        ]);
    }

    public function test_admin_can_add_quote_to_leader()
    {
        $user = User::factory()->admin()->create();
        $leader = Leader::create([
            'name' => 'John Doe',
            'slug' => 'john-doe',
        ]);

        $response = $this->actingAs($user)->post(route('quotes.store'), [
            'leader_id' => $leader->id,
            'quote' => 'This is a test quote',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('quotes', [
            'leader_id' => $leader->id,
            'quote' => 'This is a test quote',
        ]);
    }

    public function test_public_can_view_leader_profile()
    {
        $leader = Leader::create([
            'name' => 'John Doe',
            'slug' => 'john-doe',
            'bio' => 'Public bio',
        ]);

        $quote = Quote::create([
            'leader_id' => $leader->id,
            'quote' => 'Public quote',
        ]);

        $response = $this->get(route('leader.show', 'john-doe'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('leaders/show')
            ->where('leader.name', 'John Doe')
            ->has('leader.quotes', 1)
        );
    }
}
