<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->timestamp('published_at')->useCurrent();
            $table->unique(['room_id', 'quiz_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_quizzes');
    }
};
