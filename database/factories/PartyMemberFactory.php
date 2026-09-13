<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PartyMember>
 */
class PartyMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'occupation' => fake()->jobTitle(),
            'party_member_type_id' => \App\Models\PartyMemberType::factory(),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'joined_nc_at' => fake()->optional()->date('Y-m-d'),
            'province_id' => fake()->numberBetween(1, 7),
            'district_id' => fake()->numberBetween(1, 77),
            'municipality_id' => fake()->numberBetween(1, 753),
            'ward_number' => fake()->numberBetween(1, 33),
            'tole' => fake()->optional()->streetName(),
            'permanent_province_id' => 3,
            'permanent_district_id' => 27,
            'permanent_municipality_id' => 100,
            'permanent_ward_number' => 5,
            'permanent_tole' => fake()->streetName(),
            'is_temp_same_as_perm' => true,
            'address_type' => fake()->randomElement(['permanent', 'temporary']),
            'lives_abroad' => false,
            'country' => null,
            'facebook_url' => null,
            'twitter_url' => null,
            'instagram_url' => null,
            'tiktok_url' => null,
            'linkedin_url' => null,
        ];
    }
}
