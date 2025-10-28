<?php

namespace App\Enums;

enum QuizMode: string
{
    case Training = 'training';
    case Exam = 'exam';
    case SchoolCode = 'school_code';
}
