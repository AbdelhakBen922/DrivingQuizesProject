<?php

namespace Database\Factories;

use App\Models\AccessCode;
use App\Models\Quiz;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<AccessCode> */
class AccessCodeFactory extends Factory
{
    protected $model = AccessCode::class;

    public function definition(): array
    {
        $now = now();
        return [
            'school_id' => School::factory(),
            'quiz_id' => null,
            'code' => strtoupper(Str::random(8)),
            'valid_from' => $now,
            'valid_to' => $now->copy()->addDays(7),
            'usage_limit' => $this->faker->randomElement([0, 10, 50, 100]),
            'used_count' => 0,
        ];
    }
}
