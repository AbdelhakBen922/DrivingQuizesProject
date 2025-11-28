<?php

namespace Database\Factories;

use App\Models\QuizAttempt;
use App\Models\Quiz;
use App\Models\RoomMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<QuizAttempt> */
class QuizAttemptFactory extends Factory
{
    protected $model = QuizAttempt::class;

    public function definition(): array
    {
        $faker = $this->withFaker();
        $startedAt = $faker->dateTimeBetween('-10 days', 'now');
        $finished = $faker->boolean(70);

        return [
            'quiz_id' => Quiz::factory(),
            'room_member_id' => RoomMember::factory(),
            'access_code_id' => null,
            'score' => $finished ? $faker->numberBetween(0, 100) : 0,
            'started_at' => $startedAt,
            'finished_at' => $finished ? $faker->dateTimeBetween($startedAt, 'now') : null,
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
