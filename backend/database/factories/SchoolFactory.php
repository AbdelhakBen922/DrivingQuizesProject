<?php

namespace Database\Factories;

use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<School> */
class SchoolFactory extends Factory
{
    protected $model = School::class;

    public function definition(): array
    {
        $faker = $this->withFaker();
        
        return [
            'name' => $faker->company(),
            'email' => $faker->unique()->safeEmail(),
            'password' => bcrypt('password'),
            'created_at' => now(),
        ];
    }
}
