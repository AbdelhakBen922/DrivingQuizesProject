from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime, timezone
from pydantic import BaseModel
import random

from app.api.deps.auth import get_current_student
from app.core.config import settings
from app.core.database import get_db
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz_setting import QuizSetting
from app.models.room_member import RoomMember
from app.models.student import Student
from app.models.question import Question
from app.models.choice import Choice
from app.models.answer import Answer
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.quiz_template import QuizTemplate
from app.models.enums import QuizMode, VehicleType

router = APIRouter(prefix="/quiz", tags=["student-quiz"])


class ChoiceResponse(BaseModel):
    id: int
    text: str
    position: int


class QuestionResponse(BaseModel):
    id: int
    text: str
    image_url: str | None
    choices: List[ChoiceResponse]
    answered_choice_id: int | None = None
    duration_sec: int | None = None
    duration_sec: int | None = None


class QuizAttemptResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    quiz_title: str
    attempt_number: int
    started_at: datetime
    questions: List[QuestionResponse]
    total_questions: int
    current_question_index: int


class StartQuizResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    quiz_title: str
    attempt_number: int
    total_questions: int
    questions: List[QuestionResponse]


class SubmitAnswerRequest(BaseModel):
    question_id: int
    choice_id: int


class SubmitAnswerResponse(BaseModel):
    success: bool
    message: str
    is_correct: bool


class FinishQuizResponse(BaseModel):
    attempt_id: int
    score: int
    total_questions: int
    correct_answers: int
    percentage: float
    passed: bool


def _resolve_text(ar: str, fr: str, lang: str) -> str:
    return ar if lang == "ar" else fr


def _resolve_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    # If already absolute (http/https) return as-is
    if image_path.startswith("http://") or image_path.startswith("https://"):
        return image_path
    # Normalize stored paths that may include leading slashes
    normalized = image_path.lstrip("/")
    # Remove "data/" prefix if present (stored paths are like "data/individual_signs/...")
    if normalized.startswith("data/"):
        normalized = normalized[5:]  # Remove "data/" prefix
    # Return absolute URL with backend base URL
    backend_url = settings.backend_url.rstrip("/")
    return f"{backend_url}/data/{normalized}"


@router.post("/{quiz_id}/start", response_model=StartQuizResponse)
async def start_quiz(
    quiz_id: int,
    lang: str = Query(default="fr"),
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> StartQuizResponse:
    """Start a new quiz attempt"""
    
    # Get quiz and verify student has access
    quiz_query = select(Quiz, QuizSetting).outerjoin(
        QuizSetting, Quiz.setting_id == QuizSetting.id
    ).where(
        Quiz.id == quiz_id,
        Quiz.deleted_at.is_(None)
    )
    quiz_result = await session.execute(quiz_query)
    quiz_row = quiz_result.first()
    
    if not quiz_row:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz = quiz_row.Quiz
    settings = quiz_row.QuizSetting
    
    # Check if quiz is active (within time window)
    current_time = datetime.now(timezone.utc)
    if quiz.starts_at and current_time < quiz.starts_at:
        raise HTTPException(status_code=403, detail="Quiz has not started yet")
    if quiz.ends_at and current_time > quiz.ends_at:
        raise HTTPException(status_code=403, detail="Quiz has ended")
    
    # Check if student is in the room for this quiz
    room_member_query = select(RoomMember).where(
        RoomMember.student_id == current_student.id,
        RoomMember.room_id == quiz.room_id,
        RoomMember.left_at.is_(None)
    )
    room_member_result = await session.execute(room_member_query)
    room_member = room_member_result.scalar_one_or_none()
    
    if not room_member:
        raise HTTPException(status_code=403, detail="You don't have access to this quiz")
    
    # Store all necessary values from ORM objects before any potential rollback
    # (rollback expires all objects in the session)
    room_member_id = room_member.id
    quiz_template_id = quiz.template_id
    quiz_school_id = quiz.school_id
    lang = lang.lower()
    quiz_title = _resolve_text(quiz.title_ar, quiz.title_fr, lang)
    settings_question_count = settings.question_count if settings else 10
    
    # Check for existing active attempt
    existing_attempt_query = select(QuizAttempt).where(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.room_member_id == room_member_id,
        QuizAttempt.finished_at.is_(None)
    )
    existing_attempt_result = await session.execute(existing_attempt_query)
    existing_attempt = existing_attempt_result.scalar_one_or_none()
    
    if existing_attempt:
        # Return existing attempt with questions
        attempt_to_use = existing_attempt
        attempt_number = existing_attempt.attempt_number
    else:
        # Get attempt number
        attempt_count_query = select(func.count(QuizAttempt.id)).where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.room_member_id == room_member_id
        )
        attempt_count_result = await session.execute(attempt_count_query)
        attempt_count = attempt_count_result.scalar() or 0
        attempt_number = attempt_count + 1
        
        # Try to create new attempt (handle race condition)
        try:
            new_attempt = QuizAttempt(
                quiz_id=quiz_id,
                room_member_id=room_member_id,
                attempt_number=attempt_number,
                started_at=datetime.now(timezone.utc),
            )
            session.add(new_attempt)
            await session.flush()
            attempt_to_use = new_attempt
        except IntegrityError:
            # Another request just created this attempt, fetch it
            await session.rollback()
            recheck_attempt_query = select(QuizAttempt).where(
                QuizAttempt.quiz_id == quiz_id,
                QuizAttempt.room_member_id == room_member_id,
                QuizAttempt.attempt_number == attempt_number
            )
            recheck_result = await session.execute(recheck_attempt_query)
            attempt_to_use = recheck_result.scalar_one()
    
    # Get questions for this quiz
    # Try from template first, then from school's question bank
    if quiz_template_id:
        questions_query = select(Question, Choice, QuizTemplateQuestion).join(
            QuizTemplateQuestion, QuizTemplateQuestion.question_id == Question.id
        ).outerjoin(
            Choice, Choice.question_id == Question.id
        ).where(
            QuizTemplateQuestion.template_id == quiz_template_id,
            Question.deleted_at.is_(None)
        ).order_by(Question.id, Choice.position)
    else:
        # Fallback: get questions from school's question bank
        questions_query = select(Question, Choice).outerjoin(
            Choice, Choice.question_id == Question.id
        ).where(
            Question.school_id == quiz_school_id,
            Question.deleted_at.is_(None)
        ).order_by(Question.id, Choice.position)
    
    questions_result = await session.execute(questions_query)
    questions_data = questions_result.all()
    
    if not questions_data:
        raise HTTPException(status_code=400, detail="No questions available for this quiz")
    
    # Group by question
    questions_dict = {}
    for row in questions_data:
        q = row.Question
        c = row.Choice if hasattr(row, 'Choice') else None
        qtq = row.QuizTemplateQuestion if hasattr(row, 'QuizTemplateQuestion') else None
        
        if q.id not in questions_dict:
            questions_dict[q.id] = {
                'question': q,
                'choices': [],
                'duration_sec': qtq.duration_sec if qtq else None
            }
        
        if c:
            questions_dict[q.id]['choices'].append(c)
    
    # Limit to question_count from settings
    selected_questions = list(questions_dict.values())[:settings_question_count]
    
    if not selected_questions:
        raise HTTPException(status_code=400, detail="No questions available for this quiz")
    
    # Build response
    question_responses = []
    for q_data in selected_questions:
        q = q_data['question']
        choices = q_data['choices']
        duration_sec = q_data.get('duration_sec')
        
        question_responses.append(QuestionResponse(
            id=q.id,
            text=_resolve_text(q.text_ar, q.text_fr, lang),
            image_url=_resolve_image_url(q.image_url),
            choices=[
                ChoiceResponse(
                    id=choice.id,
                    text=_resolve_text(choice.text_ar, choice.text_fr, lang),
                    position=choice.position
                ) for choice in sorted(choices, key=lambda x: x.position)
            ],
            answered_choice_id=None,
            duration_sec=duration_sec
        ))
    
    await session.commit()
    
    return StartQuizResponse(
        attempt_id=attempt_to_use.id,
        quiz_id=quiz_id,
        quiz_title=quiz_title,
        attempt_number=attempt_number,
        total_questions=len(question_responses),
        questions=question_responses
    )


class StartTrainingQuizRequest(BaseModel):
    question_count: int = 10
    vehicle_type: str = "car"


@router.post("/training/start", response_model=StartQuizResponse)
async def start_training_quiz(
    request: StartTrainingQuizRequest,
    lang: str = Query(default="fr"),
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> StartQuizResponse:
    """
    Start a training quiz session with randomly selected questions from test-01.
    This creates a temporary quiz session without requiring a specific quiz assignment.
    """
    
    # Validate question count
    if request.question_count not in [5, 10, 15]:
        raise HTTPException(status_code=400, detail="Question count must be 5, 10, or 15")
    
    # Find test-01 template (first imported template)
    # Look for template with tags containing source_test_id='test-01' or title containing 'test-01'
    template_query = select(QuizTemplate).where(
        QuizTemplate.deleted_at.is_(None),
        QuizTemplate.settings['source_test_id'].astext == 'test-01'
    )
    template_result = await session.execute(template_query)
    template = template_result.scalar_one_or_none()
    
    if not template:
        # Fallback: try to find by checking quizzes with test-01 in tags
        quiz_query = select(Quiz).join(
            QuizTemplate, Quiz.template_id == QuizTemplate.id
        ).where(
            Quiz.deleted_at.is_(None),
            QuizTemplate.deleted_at.is_(None)
        ).limit(1)
        quiz_result = await session.execute(quiz_query)
        quiz_with_template = quiz_result.scalar_one_or_none()
        
        if quiz_with_template:
            template_query = select(QuizTemplate).where(
                QuizTemplate.id == quiz_with_template.template_id
            )
            template_result = await session.execute(template_query)
            template = template_result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=404, 
            detail="Training template not found. Please ensure test-01 data has been imported."
        )
    
    # Get all questions from this template
    questions_query = select(Question, Choice, QuizTemplateQuestion).join(
        QuizTemplateQuestion, QuizTemplateQuestion.question_id == Question.id
    ).outerjoin(
        Choice, Choice.question_id == Question.id
    ).where(
        QuizTemplateQuestion.template_id == template.id,
        Question.deleted_at.is_(None)
    ).order_by(Question.id, Choice.position)
    
    questions_result = await session.execute(questions_query)
    questions_data = questions_result.all()
    
    if not questions_data:
        raise HTTPException(status_code=400, detail="No questions available in training template")
    
    # Group by question
    questions_dict = {}
    for row in questions_data:
        q = row.Question
        c = row.Choice if hasattr(row, 'Choice') else None
        qtq = row.QuizTemplateQuestion if hasattr(row, 'QuizTemplateQuestion') else None
        
        if q.id not in questions_dict:
            questions_dict[q.id] = {
                'question': q,
                'choices': [],
                'duration_sec': qtq.duration_sec if qtq else None
            }
        
        if c:
            questions_dict[q.id]['choices'].append(c)
    
    # Randomly select N questions
    all_questions = list(questions_dict.values())
    if len(all_questions) < request.question_count:
        selected_questions = all_questions
    else:
        selected_questions = random.sample(all_questions, request.question_count)
    
    if not selected_questions:
        raise HTTPException(status_code=400, detail="No questions available for training")
    
    # Find or create a default room for the student's school
    # Training mode doesn't require a specific room assignment
    room_member_query = select(RoomMember).where(
        RoomMember.student_id == current_student.id,
        RoomMember.left_at.is_(None)
    ).limit(1)
    room_member_result = await session.execute(room_member_query)
    room_member = room_member_result.scalar_one_or_none()
    
    if not room_member:
        raise HTTPException(
            status_code=403, 
            detail="No room membership found. Please contact your school administrator."
        )
    
    # Create or find a training quiz for this template
    # Use a special naming convention for training quizzes
    training_quiz_query = select(Quiz).where(
        Quiz.template_id == template.id,
        Quiz.school_id == current_student.school_id,
        Quiz.deleted_at.is_(None),
        Quiz.title_ar.contains('تدريب')  # Contains 'training' in Arabic
    ).limit(1)
    training_quiz_result = await session.execute(training_quiz_query)
    training_quiz = training_quiz_result.scalar_one_or_none()
    
    if not training_quiz:
        # Create a training quiz setting
        training_setting = QuizSetting(
            vehicle_type=VehicleType.CAR,
            mode=QuizMode.TRAINING,
            question_count=request.question_count,
            randomize_questions=True,
            randomize_choices=True,
            passing_score=60,
            review_allowed=True,
        )
        session.add(training_setting)
        await session.flush()
        
        # Create a training quiz
        training_quiz = Quiz(
            school_id=current_student.school_id,
            setting_id=training_setting.id,
            template_id=template.id,
            room_id=room_member.room_id,
            title_ar="اختبار تدريبي",
            title_fr="Quiz d'entraînement",
            description="Training mode quiz with randomly selected questions",
            is_public=False,
        )
        session.add(training_quiz)
        await session.flush()
    
    # Get attempt number for this student
    attempt_count_query = select(func.count(QuizAttempt.id)).where(
        QuizAttempt.quiz_id == training_quiz.id,
        QuizAttempt.room_member_id == room_member.id
    )
    attempt_count_result = await session.execute(attempt_count_query)
    attempt_count = attempt_count_result.scalar() or 0
    attempt_number = attempt_count + 1
    
    # Create new training attempt
    new_attempt = QuizAttempt(
        quiz_id=training_quiz.id,
        room_member_id=room_member.id,
        attempt_number=attempt_number,
        started_at=datetime.now(timezone.utc),
    )
    session.add(new_attempt)
    await session.flush()
    
    # Build response with selected questions
    lang = lang.lower()
    quiz_title = _resolve_text(training_quiz.title_ar, training_quiz.title_fr, lang)
    
    question_responses = []
    for q_data in selected_questions:
        q = q_data['question']
        choices = q_data['choices']
        duration_sec = q_data.get('duration_sec')
        
        question_responses.append(QuestionResponse(
            id=q.id,
            text=_resolve_text(q.text_ar, q.text_fr, lang),
            image_url=_resolve_image_url(q.image_url),
            choices=[
                ChoiceResponse(
                    id=choice.id,
                    text=_resolve_text(choice.text_ar, choice.text_fr, lang),
                    position=choice.position
                ) for choice in sorted(choices, key=lambda x: x.position)
            ],
            answered_choice_id=None,
            duration_sec=duration_sec
        ))
    
    await session.commit()
    
    return StartQuizResponse(
        attempt_id=new_attempt.id,
        quiz_id=training_quiz.id,
        quiz_title=quiz_title,
        attempt_number=attempt_number,
        total_questions=len(question_responses),
        questions=question_responses
    )


@router.post("/{quiz_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    quiz_id: int,
    answer_data: SubmitAnswerRequest,
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> SubmitAnswerResponse:
    """Submit an answer for a question"""
    
    # Check if quiz is still active
    quiz_query = select(Quiz).where(Quiz.id == quiz_id, Quiz.deleted_at.is_(None))
    quiz_result = await session.execute(quiz_query)
    quiz = quiz_result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    current_time = datetime.now(timezone.utc)
    if quiz.ends_at and current_time > quiz.ends_at:
        raise HTTPException(status_code=403, detail="Quiz has ended")
    
    # Get active attempt
    room_member_query = select(RoomMember).where(
        RoomMember.student_id == current_student.id,
        RoomMember.left_at.is_(None)
    )
    room_member_result = await session.execute(room_member_query)
    room_member = room_member_result.scalar_one_or_none()
    
    if not room_member:
        raise HTTPException(status_code=403, detail="Room membership not found")
    
    attempt_query = select(QuizAttempt).where(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.room_member_id == room_member.id,
        QuizAttempt.finished_at.is_(None)
    )
    attempt_result = await session.execute(attempt_query)
    attempt = attempt_result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")
    
    # Get the choice and check if it's correct
    choice_query = select(Choice).where(Choice.id == answer_data.choice_id)
    choice_result = await session.execute(choice_query)
    choice = choice_result.scalar_one_or_none()
    
    if not choice:
        raise HTTPException(status_code=404, detail="Choice not found")
    
    # Check if answer already exists
    existing_answer_query = select(Answer).where(
        Answer.attempt_id == attempt.id,
        Answer.question_id == answer_data.question_id
    )
    existing_answer_result = await session.execute(existing_answer_query)
    existing_answer = existing_answer_result.scalar_one_or_none()
    
    if existing_answer:
        # Update existing answer
        existing_answer.choice_id = answer_data.choice_id
        existing_answer.is_correct = choice.is_correct
        existing_answer.answered_at = datetime.now(timezone.utc)
    else:
        # Create new answer
        new_answer = Answer(
            attempt_id=attempt.id,
            question_id=answer_data.question_id,
            choice_id=answer_data.choice_id,
            is_correct=choice.is_correct,
            answered_at=datetime.now(timezone.utc)
        )
        session.add(new_answer)
    
    await session.commit()
    
    return SubmitAnswerResponse(
        success=True,
        message="Answer saved successfully",
        is_correct=choice.is_correct
    )


@router.post("/{quiz_id}/finish", response_model=FinishQuizResponse)
async def finish_quiz(
    quiz_id: int,
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> FinishQuizResponse:
    """Finish quiz and calculate score"""
    
    # Get active attempt
    room_member_query = select(RoomMember).where(
        RoomMember.student_id == current_student.id,
        RoomMember.left_at.is_(None)
    )
    room_member_result = await session.execute(room_member_query)
    room_member = room_member_result.scalar_one_or_none()
    
    if not room_member:
        raise HTTPException(status_code=403, detail="Room membership not found")
    
    attempt_query = select(QuizAttempt).where(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.room_member_id == room_member.id,
        QuizAttempt.finished_at.is_(None)
    )
    attempt_result = await session.execute(attempt_query)
    attempt = attempt_result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")
    
    # Get all answers for this attempt
    answers_query = select(Answer).where(Answer.attempt_id == attempt.id)
    answers_result = await session.execute(answers_query)
    answers = answers_result.scalars().all()
    
    # Calculate score
    total_questions = len(answers)
    correct_answers = sum(1 for a in answers if a.is_correct)
    percentage = round((correct_answers / total_questions * 100), 2) if total_questions > 0 else 0
    
    # Get quiz settings for passing score
    quiz_query = select(Quiz, QuizSetting).outerjoin(
        QuizSetting, Quiz.setting_id == QuizSetting.id
    ).where(Quiz.id == quiz_id)
    quiz_result = await session.execute(quiz_query)
    quiz_row = quiz_result.first()
    
    passing_score = quiz_row.QuizSetting.passing_score if quiz_row and quiz_row.QuizSetting else 70
    passed = percentage >= passing_score
    
    # Update attempt
    attempt.finished_at = datetime.now(timezone.utc)
    attempt.score = int(percentage)
    
    # Calculate time spent
    if attempt.started_at:
        time_spent = (datetime.now(timezone.utc) - attempt.started_at).total_seconds()
        attempt.time_spent_sec = int(time_spent)
    
    await session.commit()
    
    return FinishQuizResponse(
        attempt_id=attempt.id,
        score=int(percentage),
        total_questions=total_questions,
        correct_answers=correct_answers,
        percentage=percentage,
        passed=passed
    )


class QuizReviewQuestionResponse(BaseModel):
    id: int
    text: str
    image_url: str | None
    student_answer_choice_id: int | None
    correct_choice_id: int
    is_correct: bool
    choices: List[ChoiceResponse]


class QuizReviewResponse(BaseModel):
    attempt_id: int
    quiz_title: str
    score: int
    total_questions: int
    correct_answers: int
    percentage: float
    passed: bool
    questions: List[QuizReviewQuestionResponse]


@router.get("/{quiz_id}/review/{attempt_id}", response_model=QuizReviewResponse)
async def get_quiz_review(
    quiz_id: int,
    attempt_id: int,
    lang: str = Query(default="fr"),
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> QuizReviewResponse:
    """Get detailed quiz review with correct answers and language selection"""
    
    # Get quiz attempt - find by student, not just current room membership
    # This allows viewing results even if student left the room
    attempt_query = select(QuizAttempt, Quiz, RoomMember).join(
        Quiz, QuizAttempt.quiz_id == Quiz.id
    ).join(
        RoomMember, QuizAttempt.room_member_id == RoomMember.id
    ).where(
        QuizAttempt.id == attempt_id,
        QuizAttempt.quiz_id == quiz_id,
        RoomMember.student_id == current_student.id,
        QuizAttempt.finished_at.isnot(None)
    )
    attempt_result = await session.execute(attempt_query)
    attempt_row = attempt_result.first()
    
    if not attempt_row:
        raise HTTPException(status_code=404, detail="Quiz attempt not found or not finished")
    
    attempt = attempt_row.QuizAttempt
    quiz = attempt_row.Quiz
    
    # Get all answers with question and choice data
    answers_query = select(Answer, Question, Choice).join(
        Question, Answer.question_id == Question.id
    ).join(
        Choice, Answer.choice_id == Choice.id
    ).where(
        Answer.attempt_id == attempt_id
    ).order_by(Question.id)
    
    answers_result = await session.execute(answers_query)
    answers_data = answers_result.all()
    
    # Get all choices for each question
    question_ids = [row.Question.id for row in answers_data]
    choices_query = select(Choice).where(Choice.question_id.in_(question_ids)).order_by(Choice.position)
    choices_result = await session.execute(choices_query)
    all_choices = choices_result.scalars().all()
    
    # Group choices by question
    choices_by_question = {}
    for choice in all_choices:
        if choice.question_id not in choices_by_question:
            choices_by_question[choice.question_id] = []
        choices_by_question[choice.question_id].append(choice)
    
    # Find correct choice for each question
    correct_choices = {}
    for q_id, choices in choices_by_question.items():
        for choice in choices:
            if choice.is_correct:
                correct_choices[q_id] = choice.id
                break
    
    lang = lang.lower()

    # Build review questions
    review_questions = []
    for row in answers_data:
        answer = row.Answer
        question = row.Question
        
        review_questions.append(QuizReviewQuestionResponse(
            id=question.id,
            text=_resolve_text(question.text_ar, question.text_fr, lang),
            image_url=_resolve_image_url(question.image_url),
            student_answer_choice_id=answer.choice_id,
            correct_choice_id=correct_choices.get(question.id, 0),
            is_correct=answer.is_correct,
            choices=[
                ChoiceResponse(
                    id=c.id,
                    text=_resolve_text(c.text_ar, c.text_fr, lang),
                    position=c.position
                ) for c in choices_by_question.get(question.id, [])
            ]
        ))
    
    # Calculate stats
    total_questions = len(review_questions)
    correct_answers = sum(1 for q in review_questions if q.is_correct)
    percentage = round((correct_answers / total_questions * 100), 2) if total_questions > 0 else 0
    
    # Get passing score
    settings_query = select(QuizSetting).where(QuizSetting.id == quiz.setting_id)
    settings_result = await session.execute(settings_query)
    settings = settings_result.scalar_one_or_none()
    passing_score = settings.passing_score if settings else 70
    passed = percentage >= passing_score
    
    return QuizReviewResponse(
        attempt_id=attempt.id,
        quiz_title=_resolve_text(quiz.title_ar, quiz.title_fr, lang),
        score=attempt.score or 0,
        total_questions=total_questions,
        correct_answers=correct_answers,
        percentage=percentage,
        passed=passed,
        questions=review_questions
    )
