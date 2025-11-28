<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_settings', function (Blueprint $table) {
            $table->id();
            // One-to-one with quizzes (unique foreign key)
            $table->foreignId('quiz_id')->unique()->constrained('quizzes')->cascadeOnDelete();
            $table->enum('vehicle_type', ['car', 'motorcycle', 'truck'])->default('car');
            $table->integer('question_count')->default(10);
            $table->enum('mode', ['training', 'exam', 'school_code'])->default('training');
            $table->boolean('randomize_questions')->default(true);
            $table->boolean('randomize_choices')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_settings');
    }
};
