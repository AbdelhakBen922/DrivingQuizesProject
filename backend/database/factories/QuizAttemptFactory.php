<?php

namespace Database\Factories;

use App\Models\QuizAttempt;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<QuizAttempt> */
class QuizAttemptFactory extends Factory
{
    protected $model = QuizAttempt::class;

    public function definition(): array
    {
        $startedAt = $this->faker->dateTimeBetween('-10 days', 'now');
        $finished = $this->faker->boolean(70);

        return [
            'quiz_id' => Quiz::factory(),
            'access_code_id' => null,
            'full_name' => $this->faker->name(),
            'score' => $finished ? $this->faker->numberBetween(0, 100) : 0,
            'started_at' => $startedAt,
            'finished_at' => $finished ? $this->faker->dateTimeBetween($startedAt, 'now') : null,
        ];
    }

    public function finished(): self
    {
        return $this->state(function (array $attributes) {
            $startedAt = $attributes['started_at'] ?? now()->subHour();
            return [
                'finished_at' => now(),
                'score' => $attributes['score'] ?? $this->faker->numberBetween(0, 100),
                'started_at' => $startedAt,
            ];
        });
    }
}
