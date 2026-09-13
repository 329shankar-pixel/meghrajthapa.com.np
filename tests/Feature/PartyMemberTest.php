<?php

use App\Models\PartyMember;
use App\Models\PartyMemberType;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected from party member pages', function () {
    $this->get(route('party-members.index'))->assertRedirect(route('login'));
    $this->get(route('party-members.create'))->assertRedirect(route('login'));
});

test('authenticated users can view party members index', function () {
    $this->actingAs(User::factory()->admin()->create());

    $this->get(route('party-members.index'))->assertOk();
});

test('authenticated users can view create party member form', function () {
    $this->actingAs(User::factory()->admin()->create());

    $response = $this->get(route('party-members.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('party-members/create')
        ->has('provinces')
        ->has('partyMemberTypes')
    );
});

test('authenticated users can create a party member', function () {
    $this->actingAs(User::factory()->admin()->create());
    $partyMemberType = PartyMemberType::factory()->create();

    $data = [
        'full_name' => 'Ram Bahadur Shrestha',
        'gender' => 'male',
        'phone' => '9841123456',
        'email' => 'ram@shrestha.com',
        'party_member_type_id' => $partyMemberType->id,
        'date_of_birth' => '1990-01-15',
        'joined_nc_at' => '2020-05-01',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'permanent_tole' => 'Permanent Tole',
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertRedirect(route('party-members.index'));
    $this->assertDatabaseHas('party_members', [
        'full_name' => 'Ram Bahadur Shrestha',
        'gender' => 'male',
        'phone' => '9841123456',
        'email' => 'ram@shrestha.com',
    ]);
});

test('party member creation requires full name', function () {
    $this->actingAs(User::factory()->admin()->create());
    $partyMemberType = PartyMemberType::factory()->create();

    $data = [
        'full_name' => '',
        'gender' => 'male',
        'phone' => '9841123456',
        'email' => 'ram@shrestha.com',
        'party_member_type_id' => $partyMemberType->id,
        'date_of_birth' => '1990-01-15',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertSessionHasErrors('full_name');
});

test('party member creation requires valid gender', function () {
    $this->actingAs(User::factory()->admin()->create());
    $partyMemberType = PartyMemberType::factory()->create();

    $data = [
        'full_name' => 'Test User',
        'gender' => 'invalid',
        'phone' => '9841123456',
        'email' => 'test@example.com',
        'party_member_type_id' => $partyMemberType->id,
        'date_of_birth' => '1990-01-15',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertSessionHasErrors('gender');
});

test('party member creation requires valid party member type', function () {
    $this->actingAs(User::factory()->admin()->create());

    $data = [
        'full_name' => 'Test User',
        'gender' => 'male',
        'phone' => '9841123456',
        'email' => 'ram@shrestha.com',
        'party_member_type_id' => 999,
        'date_of_birth' => '1990-01-15',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertSessionHasErrors('party_member_type_id');
});

test('party member creation requires phone', function () {
    $this->actingAs(User::factory()->admin()->create());

    $data = [
        'full_name' => 'Test User',
        'gender' => 'male',
        'phone' => '',
        'email' => 'ram@shrestha.com',
        'party_member_type_id' => PartyMemberType::factory()->create()->id,
        'date_of_birth' => '1990-01-15',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertSessionHasErrors('phone');
});

test('party member creation requires email', function () {
    $this->actingAs(User::factory()->admin()->create());

    $data = [
        'full_name' => 'Test User',
        'gender' => 'male',
        'phone' => '9841123456',
        'email' => '',
        'party_member_type_id' => PartyMemberType::factory()->create()->id,
        'date_of_birth' => '1990-01-15',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertSessionHasErrors('email');
});

test('party member creation requires unique email', function () {
    $this->actingAs(User::factory()->admin()->create());
    $existingMember = PartyMember::factory()->create(['email' => 'test@example.com']);

    $data = [
        'full_name' => 'Test User',
        'gender' => 'male',
        'phone' => '9841123456',
        'email' => 'test@example.com',
        'party_member_type_id' => PartyMemberType::factory()->create()->id,
        'date_of_birth' => '1990-01-15',
        'province_id' => 3,
        'district_id' => 27,
        'municipality_id' => 100,
        'ward_number' => 5,
        'permanent_province_id' => 3,
        'permanent_district_id' => 27,
        'permanent_municipality_id' => 100,
        'permanent_ward_number' => 5,
        'is_temp_same_as_perm' => true,
        'address_type' => 'permanent',
        'lives_abroad' => false,
    ];

    $response = $this->post(route('party-members.store'), $data);

    $response->assertSessionHasErrors('email');
});

test('authenticated users can view a party member', function () {
    $this->actingAs(User::factory()->admin()->create());
    $partyMember = PartyMember::factory()->create();

    $response = $this->get(route('party-members.show', $partyMember));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('party-members/show')
        ->has('partyMember')
        ->has('location')
    );
});

test('authenticated users can delete a party member', function () {
    $this->actingAs(User::factory()->admin()->create());
    $partyMember = PartyMember::factory()->create();

    $response = $this->delete(route('party-members.destroy', $partyMember));

    $response->assertRedirect(route('party-members.index'));
    $this->assertDatabaseMissing('party_members', ['id' => $partyMember->id]);
});

test('location api returns provinces', function () {
    $this->actingAs(User::factory()->admin()->create());

    $response = $this->get(route('api.provinces'));

    $response->assertOk();
    $response->assertJsonStructure([
        '*' => ['id', 'name'],
    ]);
});

test('location api returns districts for a province', function () {
    $this->actingAs(User::factory()->admin()->create());

    $response = $this->get(route('api.districts', ['province' => 3]));

    $response->assertOk();
    $response->assertJsonStructure([
        '*' => ['id', 'name'],
    ]);
});

test('location api returns municipalities for a district', function () {
    $this->actingAs(User::factory()->admin()->create());

    $response = $this->get(route('api.municipalities', ['district' => 27]));

    $response->assertOk();
    $response->assertJsonStructure([
        '*' => ['id', 'name', 'category_id'],
    ]);
});
