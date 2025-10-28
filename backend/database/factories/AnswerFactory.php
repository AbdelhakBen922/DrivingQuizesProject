<?php

namespace Database\Factories;

use App\Models\Answer;
use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\Choice;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Answer> */
class AnswerFactory extends Factory
{
    protected $model = Answer::class;

    public function definition(): array
    {
        return [
            'attempt_id' => QuizAttempt::factory(),
            'question_id' => Question::factory(),
            'choice_id' => null, // set coherently in seeder
            'answer_text' => null,
            'is_correct' => null,
            'answered_at' => now(),
        ];
    }
}
