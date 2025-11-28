<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    use HasFactory; # this is needed for factory usage factroy is defined by laravel for model creation and testing

    public $timestamps = false; // Disable automatic timestamps

    protected $fillable = [
        'quiz_id',
        'room_member_id',
        'access_code_id',
        'started_at',
        'finished_at',
        'score',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'score' => 'integer',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function roomMember(): BelongsTo
    {
        return $this->belongsTo(RoomMember::class);
    }

    public function accessCode(): BelongsTo
    {
        return $this->belongsTo(RoomAccessCode::class, 'access_code_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class, 'attempt_id');
    }
}
