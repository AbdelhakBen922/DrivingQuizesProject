<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\VehicleType;
use App\Enums\QuizMode;

class QuizSetting extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'quiz_settings';

    protected $fillable = [
        'quiz_id',
        'vehicle_type',
        'question_count',
        'mode',
        'randomize_questions',
        'randomize_choices',
    ];

    protected $casts = [
        'vehicle_type' => VehicleType::class,
        'mode' => QuizMode::class,
        'randomize_questions' => 'boolean',
        'randomize_choices' => 'boolean',
        'question_count' => 'integer',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
