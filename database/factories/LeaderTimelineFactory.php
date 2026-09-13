<?php

namespace Database\Factories;

use App\Models\Leader;
use App\Models\LeaderTimeline;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaderTimeline>
 */
class LeaderTimelineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'leader_id' => Leader::factory(),
            'title' => fake()->sentence(4),
            'date' => fake()->date(),
            'photo' => null,
        ];
    }
}
