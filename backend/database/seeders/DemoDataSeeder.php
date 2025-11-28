<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Choice;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizSetting;
use App\Models\Room;
use App\Models\RoomAccessCode;
use App\Models\RoomMember;
use App\Models\School;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create a few schools
        $schools = School::factory(3)->create();

        foreach ($schools as $school) {
            $rooms = Room::factory(2)
                ->for($school)
                ->create()
                ->each(function (Room $room) use ($school) {
                    RoomMember::factory(5)->for($room)->create();
                    RoomAccessCode::factory(3)->create([
                        'school_id' => $school->id,
                        'room_id' => $room->id,
                    ]);
                });

            // Create quizzes for each school
            $quizzes = Quiz::factory(2)->for($school)->create();

            foreach ($quizzes as $quiz) {
                // One-to-one settings for each quiz
                QuizSetting::factory()->for($quiz)->create();

                foreach ($rooms as $room) {
                    $room->quizzes()->attach($quiz->id, ['published_at' => now()]);
                }

                // Create a pool of questions for this quiz
                $questions = Question::factory(20)->create();

                // For each question, create 4 choices with exactly one correct
                $position = 1;
                foreach ($questions as $question) {
                    $correctIndex = random_int(0, 3);
                    for ($i = 0; $i < 4; $i++) {
                        Choice::factory()->for($question)->create([
                            'is_correct' => $i === $correctIndex,
                            'position' => $i + 1,
                        ]);
                    }

                    // Attach question to quiz with a position
                    $quiz->questions()->attach($question->id, ['position' => $position++]);
                }

                // Create attempts and answers
                for ($i = 0; $i < 5; $i++) {
                    $room = $rooms->random();
                    $member = $room->members()->inRandomOrder()->first();
                    $code = $room->accessCodes()->inRandomOrder()->first();
                    $startedAt = now()->subDays(random_int(0, 7))->subMinutes(random_int(0, 120));
                    $finishedAt = random_int(0, 100) < 80
                        ? (clone $startedAt)->addMinutes(random_int(5, 60))
                        : null;

                    $attempt = QuizAttempt::create([
                        'quiz_id' => $quiz->id,
                        'room_member_id' => $member->id,
                        'access_code_id' => $code?->id,
                        'started_at' => $startedAt,
                        'finished_at' => $finishedAt,
                        'score' => 0,
                    ]);

                    $correctCount = 0;
                    foreach ($questions as $question) {
                        $choice = $question->choices()->inRandomOrder()->first();
                        $isCorrect = (bool) $choice->is_correct;
                        if ($isCorrect) {
                            $correctCount++;
                        }

                        Answer::create([
                            'attempt_id' => $attempt->id,
                            'question_id' => $question->id,
                            'choice_id' => $choice->id,
                            'answer_text' => null,
                            'is_correct' => $isCorrect,
                            'answered_at' => (clone $startedAt)->addMinutes(random_int(1, 90)),
                        ]);
                    }

                    $total = max(1, $questions->count());
                    $score = (int) round(($correctCount / $total) * 100);
                    $attempt->update(['score' => $score]);
                }
            }
        }
    }
}
