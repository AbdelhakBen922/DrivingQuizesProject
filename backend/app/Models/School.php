<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'created_at',
    ];

    protected $hidden = [
        'password',
    ];

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }
}
