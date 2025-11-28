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
        $faker = $this->withFaker();
        
        return [
            'text' => $faker->sentence(12),
            'image_url' => $faker->optional(30)->imageUrl(640, 480, 'transport'),
            'category' => $faker->randomElement(['sign', 'rule', 'priority']),
            'type' => $faker->randomElement(['single_choice', 'multiple_choice']),
            'is_required' => $faker->boolean(30),
            'created_at' => now(),
        ];
    }
}
