<?php

namespace Database\Factories;

use App\Models\RoomAccessCode;
use App\Models\Room;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<RoomAccessCode> */
class RoomAccessCodeFactory extends Factory
{
    protected $model = RoomAccessCode::class;

    public function definition(): array
    {
        $faker = $this->withFaker();
        $now = now();

        return [
            'school_id' => School::factory(),
            'room_id' => Room::factory(),
            'code' => strtoupper(Str::random(8)),
            'valid_from' => $now,
            'valid_to' => $now->copy()->addDays(7),
            'usage_limit' => $faker->randomElement([0, 10, 50, 100]),
            'used_count' => 0,
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (RoomAccessCode $code) {
            $this->syncSchoolFromRoom($code);
        })->afterCreating(function (RoomAccessCode $code) {
            $this->syncSchoolFromRoom($code, true);
        });
    }

    private function syncSchoolFromRoom(RoomAccessCode $code, bool $persist = false): void
    {
        if ($code->room && $code->room->school_id) {
            $code->school_id = $code->room->school_id;
            if ($persist && $code->isDirty('school_id')) {
                $code->save();
            }
        }
    }
}
