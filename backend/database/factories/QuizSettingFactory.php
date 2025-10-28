<?php

namespace Database\Factories;

use App\Enums\QuizMode;
use App\Enums\VehicleType;
use App\Models\Quiz;
use App\Models\QuizSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<QuizSetting> */
class QuizSettingFactory extends Factory
{
    protected $model = QuizSetting::class;

    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'vehicle_type' => $this->faker->randomElement([VehicleType::Car, VehicleType::Motorcycle, VehicleType::Truck]),
            'question_count' => $this->faker->numberBetween(10, 20),
            'time_limit_sec' => $this->faker->numberBetween(600, 1800),
            'mode' => $this->faker->randomElement([QuizMode::Training, QuizMode::Exam]),
            'randomize_questions' => $this->faker->boolean(80),
            'randomize_choices' => $this->faker->boolean(80),
        ];
    }
}
