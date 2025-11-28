<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'quiz_questions';

    protected $fillable = [
        'quiz_id',
        'question_id',
        'position',
        'duration_sec',
        'is_required',
    ];

    protected $casts = [
        'duration_sec' => 'integer',
        'is_required' => 'boolean',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
