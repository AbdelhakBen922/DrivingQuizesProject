<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->string('image_url', 255)->nullable();
            $table->enum('category', ['sign', 'rule', 'priority']);
            $table->enum('type', ['single_choice', 'multiple_choice'])->default('single_choice');
            $table->boolean('is_required')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
