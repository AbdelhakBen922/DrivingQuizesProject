<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'text',
        'image_url',
        'category',
        'type',
        'is_required',
        'created_at',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function choices(): HasMany
    {
        return $this->hasMany(Choice::class);
    }

    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'quiz_questions')
            ->withPivot(['position', 'duration_sec', 'is_required']);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }
}
