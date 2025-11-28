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
        $faker = $this->withFaker();
        
        return [
            'quiz_id' => Quiz::factory(),
            'vehicle_type' => $faker->randomElement([VehicleType::Car, VehicleType::Motorcycle, VehicleType::Truck]),
            'question_count' => $faker->numberBetween(10, 20),
            'mode' => $faker->randomElement([QuizMode::Training, QuizMode::Exam]),
            'randomize_questions' => $faker->boolean(80),
            'randomize_choices' => $faker->boolean(80),
        ];
    }
}
