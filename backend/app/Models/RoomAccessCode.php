<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomAccessCode extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'room_access_codes';

    protected $fillable = [
        'school_id',
        'room_id',
        'code',
        'valid_from',
        'valid_to',
        'usage_limit',
        'used_count',
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_to' => 'datetime',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'access_code_id');
    }
}
