<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\News>
 */
class NewsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->sentence();

        return [
            'title' => $title,
            'slug' => str($title)->slug(),
            'content' => $this->faker->paragraphs(3, true),
            'featured_image' => null,
            'meta_title' => $title,
            'meta_description' => $this->faker->sentence(),
            'meta_keywords' => implode(',', $this->faker->words(5)),
            'is_published' => $this->faker->boolean(),
            'published_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
