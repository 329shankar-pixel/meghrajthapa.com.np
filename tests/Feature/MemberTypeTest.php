<?php

use App\Models\PartyMember;
use App\Models\PartyMemberType;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated users can view member types index', function () {
    $this->actingAs(User::factory()->admin()->create());
    PartyMemberType::factory()->count(3)->create();

    $response = $this->get(route('party-member-types.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('party-member-types/index')
        ->has('partyMemberTypes', 3)
    );
});

test('authenticated users can create a member type', function () {
    $this->actingAs(User::factory()->admin()->create());

    $response = $this->post(route('party-member-types.store'), [
        'name' => 'New Type',
        'description' => 'A description of the new type',
    ]);

    $response->assertRedirect(route('party-member-types.index'));
    $this->assertDatabaseHas('party_member_types', [
        'name' => 'New Type',
        'description' => 'A description of the new type',
    ]);
});

test('member type name must be unique', function () {
    $this->actingAs(User::factory()->admin()->create());
    PartyMemberType::factory()->create(['name' => 'Existing Type']);

    $response = $this->post(route('party-member-types.store'), [
        'name' => 'Existing Type',
    ]);

    $response->assertSessionHasErrors('name');
});

test('authenticated users can update a member type', function () {
    $this->actingAs(User::factory()->admin()->create());
    $type = PartyMemberType::factory()->create(['name' => 'Old Name']);

    $response = $this->put(route('party-member-types.update', $type), [
        'name' => 'Updated Name',
        'description' => 'Updated description',
    ]);

    $response->assertRedirect(route('party-member-types.index'));
    $this->assertDatabaseHas('party_member_types', [
        'id' => $type->id,
        'name' => 'Updated Name',
    ]);
});

test('authenticated users can delete an empty member type', function () {
    $this->actingAs(User::factory()->admin()->create());
    $type = PartyMemberType::factory()->create();

    $response = $this->delete(route('party-member-types.destroy', $type));

    $response->assertRedirect(route('party-member-types.index'));
    $this->assertDatabaseMissing('party_member_types', ['id' => $type->id]);
});

test('authenticated users cannot delete a member type with active members', function () {
    $this->actingAs(User::factory()->admin()->create());
    $type = PartyMemberType::factory()->create();
    PartyMember::factory()->create(['party_member_type_id' => $type->id]);

    $response = $this->delete(route('party-member-types.destroy', $type));

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('party_member_types', ['id' => $type->id]);
});
