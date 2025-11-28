<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Room> */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        $faker = $this->withFaker();
        
        return [
            'school_id' => School::factory(),
            'name' => $faker->words(3, true),
            'description' => $faker->optional()->paragraph(),
            'join_code' => strtoupper(Str::random(6)),
            'created_at' => now(),
        ];
    }
}
