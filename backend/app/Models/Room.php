<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'join_code',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(RoomMember::class);
    }

    public function accessCodes(): HasMany
    {
        return $this->hasMany(RoomAccessCode::class);
    }

    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'room_quizzes')
            ->withPivot('published_at');
    }

    public function roomQuizzes(): HasMany
    {
        return $this->hasMany(RoomQuiz::class);
    }
}
