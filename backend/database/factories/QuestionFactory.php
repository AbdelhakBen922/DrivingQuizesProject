<?php

namespace Database\Factories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Question> */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'text' => $this->faker->sentence(12),
            'image_url' => $this->faker->optional(30)->imageUrl(640, 480, 'transport'),
            'category' => $this->faker->randomElement(['sign', 'rule', 'priority']),
            'type' => $this->faker->randomElement(['single_choice', 'multiple_choice']),
            'is_required' => $this->faker->boolean(30),
            'created_at' => now(),
        ];
    }
}
