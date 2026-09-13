<?php

namespace Database\Factories;

use App\Models\Leader;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Leader>
 */
class LeaderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'image' => null,
            'bio' => fake()->paragraphs(3, true),
            'social_links' => [
                'facebook' => 'https://facebook.com/' . Str::slug($name),
                'twitter' => 'https://twitter.com/' . Str::slug($name),
            ],
        ];
    }
}
