<?php

use App\Models\PartyMember;
use App\Models\PartyMemberType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('public user can view join page', function () {
    $response = $this->get('/joinnow');
    $response->assertStatus(200);
});

test('public user can submit join application', function () {
    $type = PartyMemberType::factory()->create();

    $response = $this->post('/joinnow', [
        'full_name' => 'John Doe',
        'gender' => 'male',
        'phone' => '9812345678',
        'email' => 'john@example.com',
        'party_member_type_id' => $type->id,
        'date_of_birth' => '1990-01-01',
        'lives_abroad' => false,
        'is_temp_same_as_perm' => true,
        'permanent_province_id' => 1,
        'permanent_district_id' => 1,
        'permanent_municipality_id' => 1,
        'permanent_ward_number' => 5,
        'permanent_tole' => 'Main Street',
        // Validations might pass with nullable, but DB requires values if no observer handles sync
        'province_id' => 1,
        'district_id' => 1,
        'municipality_id' => 1,
        'ward_number' => 5,
        'tole' => 'Main Street',
    ]);

    $response->assertRedirect('/');
    $this->assertDatabaseHas('party_members', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'permanent_ward_number' => 5,
    ]);
});
