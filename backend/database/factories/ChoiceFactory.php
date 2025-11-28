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
        $faker = $this->withFaker();
        
        return [
            'question_id' => Question::factory(),
            'text' => $faker->sentence(6),
            'is_correct' => false,
            'position' => 0,
        ];
    }
}
