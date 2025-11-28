<?php

namespace Database\Factories;

use App\Models\RoomMember;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RoomMember> */
class RoomMemberFactory extends Factory
{
    protected $model = RoomMember::class;

    public function definition(): array
    {
        $faker = $this->withFaker();
        
        return [
            'room_id' => Room::factory(),
            'full_name' => $faker->name(),
            'joined_at' => now(),
        ];
    }
}
