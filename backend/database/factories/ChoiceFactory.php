<?php

namespace Database\Factories;

use App\Models\Choice;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Choice> */
class ChoiceFactory extends Factory
{
    protected $model = Choice::class;

    public function definition(): array
    {
        return [
            'question_id' => Question::factory(),
            'text' => $this->faker->sentence(6),
            'is_correct' => false, // mark one as true in seeder
            'position' => 0,
        ];
    }
}
