<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Fetch seeds
    $this->adminRole = Role::where('slug', 'administrator')->first();
    $this->editorRole = Role::where('slug', 'editor')->first();

    // Create admin user
    $this->admin = User::factory()->create();
    $this->admin->roles()->attach($this->adminRole->id);

    // Create regular user (using seed-created user or fresh one?)
    // Regular user in this test context implies someone without admin access.
    // Editor has some access but not access-control.
    // Let's create a fresh user and assign Editor role (which has NO access-control permission)
    $this->regularUser = User::factory()->create();
    $this->regularUser->roles()->attach($this->editorRole->id);
});

it('allows admin to view users index', function () {
    $response = $this->actingAs($this->admin)->get('/users');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('users/index')
        ->has('users')
    );
});

it('prevents non-admin from viewing users index', function () {
    $response = $this->actingAs($this->regularUser)->get('/users');

    $response->assertStatus(403);
});

it('allows admin to create a user with roles', function () {
    $response = $this->actingAs($this->admin)->post('/users', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'roles' => [$this->editorRole->id],
    ]);

    $response->assertRedirect('/users');

    $this->assertDatabaseHas('users', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
    ]);

    $newUser = User::where('email', 'newuser@example.com')->first();
    expect($newUser->roles)->toHaveCount(1);
    expect($newUser->roles->first()->slug)->toBe('editor');
});

it('allows admin to update user roles', function () {
    $response = $this->actingAs($this->admin)->put("/users/{$this->regularUser->id}", [
        'name' => 'Updated Name',
        'email' => $this->regularUser->email,
        'roles' => [$this->adminRole->id],
    ]);

    $response->assertRedirect('/users');

    $this->regularUser->refresh();
    expect($this->regularUser->name)->toBe('Updated Name');
    expect($this->regularUser->roles->first()->slug)->toBe('administrator');
});

it('prevents admin from deleting themselves', function () {
    $response = $this->actingAs($this->admin)->delete("/users/{$this->admin->id}");

    $response->assertRedirect('/users');
    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});

it('prevents deleting the last administrator', function () {
    // First, remove admin role from regular user to ensure only one admin
    $this->regularUser->roles()->sync([]);

    $response = $this->actingAs($this->admin)->delete("/users/{$this->admin->id}");

    $response->assertRedirect('/users');
    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});

it('allows admin to delete other users', function () {
    $userToDelete = User::factory()->create();

    $response = $this->actingAs($this->admin)->delete("/users/{$userToDelete->id}");

    $response->assertRedirect('/users');
    $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
});

it('validates required fields when creating user', function () {
    $response = $this->actingAs($this->admin)->post('/users', [
        'name' => '',
        'email' => 'invalid-email',
        'password' => 'short',
        'password_confirmation' => 'different',
    ]);

    $response->assertSessionHasErrors(['name', 'email', 'password']);
});
