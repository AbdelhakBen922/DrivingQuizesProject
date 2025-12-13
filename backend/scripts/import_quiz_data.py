from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Sequence

from sqlalchemy import delete, select

BASE_DIR = Path(__file__).resolve().parents[1]
PARENT_DIR = BASE_DIR.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.choice import Choice  # noqa: E402
from app.models.enums import (  # noqa: E402
    QuestionCategory,
    QuestionDifficulty,
    QuestionType,
    QuizMode,
    VehicleType,
)
from app.models.question import Question  # noqa: E402
from app.models.quiz import Quiz  # noqa: E402
from app.models.quiz_setting import QuizSetting  # noqa: E402
from app.models.quiz_template import QuizTemplate  # noqa: E402
from app.models.quiz_template_question import QuizTemplateQuestion  # noqa: E402
from app.models.school import School  # noqa: E402
from app.models.staff_user import StaffUser  # noqa: E402


DEFAULT_DATA_PATH = PARENT_DIR / "data" / "backend_quiz_data.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import quiz/test content from JSON into the DrivingQuizes backend database."
    )
    parser.add_argument(
        "--data-path",
        type=Path,
        default=DEFAULT_DATA_PATH,
        help=f"Path to the quiz data JSON (default: {DEFAULT_DATA_PATH})",
    )
    parser.add_argument("--school-id", type=int, required=True, help="Target school ID for imported data")
    parser.add_argument(
        "--staff-id",
        type=int,
        required=True,
        help="Staff user ID recorded as content author/creator",
    )
    parser.add_argument(
        "--room-id",
        type=int,
        help="Optional room ID to which created quizzes should be assigned",
    )
    parser.add_argument(
        "--tests",
        nargs="*",
        help="Optional list of specific test IDs (e.g., test-01 test-02). Defaults to all tests in the file.",
    )
    parser.add_argument(
        "--vehicle-type",
        default=VehicleType.CAR.value,
        choices=[member.value for member in VehicleType],
        help="Vehicle type saved on quiz settings",
    )
    parser.add_argument(
        "--quiz-mode",
        default=QuizMode.TRAINING.value,
        choices=[member.value for member in QuizMode],
        help="Quiz mode saved on quiz settings",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip importing a test if a template with the same source_test_id already exists",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and stage data without committing DB changes",
    )
    parser.add_argument(
        "--import-tag",
        default="backend_quiz_data",
        help="Tag applied to Question.tags['data_source'] for traceability",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=1,
        help="How many tests to import before forcing a commit (default: 1)",
    )
    return parser.parse_args()


class QuizDataImporter:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.tests = self._load_tests(args.data_path, args.tests)
        self.vehicle_type = VehicleType(args.vehicle_type)
        self.quiz_mode = QuizMode(args.quiz_mode)
        self.now_iso = datetime.utcnow().isoformat()

    @staticmethod
    def _load_tests(path: Path, whitelist: Sequence[str] | None) -> list[dict[str, Any]]:
        if not path.exists():
            raise FileNotFoundError(f"Data file not found: {path}")
        with path.open("r", encoding="utf-8") as fp:
            payload = json.load(fp)
        tests = payload.get("tests") or []
        whitelist_set = {test_id.strip() for test_id in whitelist or []}
        if whitelist_set:
            tests = [test for test in tests if test.get("test_id") in whitelist_set]
        if not tests:
            raise ValueError("No tests found after applying filters; nothing to import")
        return tests

    async def run(self) -> None:
        async with AsyncSessionLocal() as session:
            await self._assert_references(session)
            processed = 0
            for test in self.tests:
                await self._import_single_test(session, test)
                processed += 1
                if not self.args.dry_run and processed % self.args.chunk_size == 0:
                    await session.commit()
                    print(f"Committed batch of {self.args.chunk_size} test(s)")
            if self.args.dry_run:
                await session.rollback()
                print("Dry-run complete; all staged changes rolled back.")
            else:
                await session.commit()
                print(f"Imported {processed} test(s) successfully.")

    async def _assert_references(self, session) -> None:
        school = await session.get(School, self.args.school_id)
        if not school:
            raise ValueError(f"School with id={self.args.school_id} not found")
        staff = await session.get(StaffUser, self.args.staff_id)
        if not staff:
            raise ValueError(f"Staff user with id={self.args.staff_id} not found")
        if staff.school_id != school.id:
            raise ValueError(
                f"Staff user {staff.id} does not belong to school {school.id}; cannot proceed"
            )
        if self.args.room_id is not None:
            from app.models.room import Room

            room = await session.get(Room, self.args.room_id)
            if not room:
                raise ValueError(f"Room with id={self.args.room_id} not found")
            if room.school_id != school.id:
                raise ValueError(
                    f"Room {room.id} belongs to school {room.school_id}, expected {school.id}"
                )
        print(
            f"Validated school #{school.id}, staff #{staff.id}"
            + (f", room #{self.args.room_id}" if self.args.room_id else "")
        )

    async def _import_single_test(self, session, test: dict[str, Any]) -> None:
        test_id = test.get("test_id")
        if not test_id:
            print("Skipping entry without test_id")
            return

        template = await self._fetch_existing_template(session, test_id)
        if template:
            if self.args.skip_existing:
                print(f"Skipping {test_id}: template already exists (id={template.id})")
                return
            print(f"Removing previous data for {test_id} (template #{template.id})")
            await self._purge_existing_template(session, template)

        await self._purge_questions_by_source(session, test_id)

        questions_payload = test.get("questions") or []
        if not questions_payload:
            print(f"No questions found for {test_id}; skipping")
            return

        created_questions = await self._create_questions(session, test_id, questions_payload)
        template = await self._create_template(session, test)
        await session.flush()
        await self._create_template_questions(session, template, created_questions)
        await self._create_quiz(session, template, test, len(created_questions))
        await session.flush()
        print(
            f"Imported {len(created_questions)} questions for {test_id} → template #{template.id}"
        )

    async def _fetch_existing_template(self, session, test_id: str) -> QuizTemplate | None:
        stmt = select(QuizTemplate).where(
            QuizTemplate.school_id == self.args.school_id,
            QuizTemplate.settings["source_test_id"].astext == test_id,
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def _purge_existing_template(self, session, template: QuizTemplate) -> None:
        from app.models.quiz_attempt import QuizAttempt
        
        quizzes_stmt = select(Quiz).where(Quiz.template_id == template.id)
        quizzes = (await session.execute(quizzes_stmt)).scalars().all()
        for quiz in quizzes:
            print(f"  - Deleting quiz #{quiz.id} linked to template #{template.id}")
            # Delete quiz attempts first to avoid FK constraint violations
            attempts_delete = delete(QuizAttempt).where(QuizAttempt.quiz_id == quiz.id)
            attempts_result = await session.execute(attempts_delete)
            if attempts_result.rowcount:
                print(f"    - Deleted {attempts_result.rowcount} quiz attempt(s)")
            await session.delete(quiz)
        await session.flush()
        await session.delete(template)
        await session.flush()

    async def _purge_questions_by_source(self, session, test_id: str) -> None:
        delete_stmt = delete(Question).where(
            Question.tags["source_test_id"].astext == test_id,
            Question.school_id == self.args.school_id,
        )
        result = await session.execute(delete_stmt)
        if result.rowcount:
            print(f"  - Removed {result.rowcount} existing question(s) for {test_id}")

    async def _create_questions(
        self, session, test_id: str, questions_payload: Sequence[dict[str, Any]]
    ) -> list[tuple[Question, dict[str, Any]]]:
        created: list[tuple[Question, dict[str, Any]]] = []
        for raw_question in questions_payload:
            question = Question(
                school_id=self.args.school_id,
                author_id=self.args.staff_id,
                text_ar=self._require_text(raw_question.get("text_ar"), fallback=raw_question.get("text_fr")),
                text_fr=self._require_text(raw_question.get("text_fr"), fallback=raw_question.get("text_ar")),
                image_url=raw_question.get("image_url"),
                category=self._enum_or_default(
                    QuestionCategory, raw_question.get("category"), QuestionCategory.RULE
                ),
                type=self._enum_or_default(QuestionType, raw_question.get("type"), QuestionType.SINGLE_CHOICE),
                difficulty=self._enum_or_default(
                    QuestionDifficulty, raw_question.get("difficulty"), QuestionDifficulty.MEDIUM
                ),
                is_required=bool(raw_question.get("is_required", True)),
                score=int(raw_question.get("score", 1)),
                explanation=raw_question.get("explanation"),
                tags=self._build_question_tags(test_id, raw_question),
            )
            session.add(question)
            await session.flush()

            choices_payload = raw_question.get("choices") or []
            if not choices_payload:
                raise ValueError(f"Question at position {raw_question.get('position')} lacks choices")
            for index, choice_payload in enumerate(choices_payload):
                choice = Choice(
                    question_id=question.id,
                    text_ar=self._require_text(choice_payload.get("text_ar")),
                    text_fr=self._require_text(choice_payload.get("text_fr"), fallback=choice_payload.get("text_ar")),
                    is_correct=bool(choice_payload.get("is_correct", False)),
                    position=int(choice_payload.get("position", index)),
                )
                session.add(choice)
            created.append((question, raw_question))
        return created

    def _build_question_tags(self, test_id: str, raw_question: dict[str, Any]) -> dict[str, Any]:
        tags = dict(raw_question.get("tags") or {})
        tags.update(
            {
                "source_test_id": test_id,
                "source_position": raw_question.get("position"),
                "data_source": self.args.import_tag,
                "imported_at": self.now_iso,
            }
        )
        return tags

    async def _create_template(self, session, test: dict[str, Any]) -> QuizTemplate:
        template = QuizTemplate(
            school_id=self.args.school_id,
            title=test.get("title") or f"Template {test.get('test_id')}",
            title_ar=self._require_text(test.get("title_ar"), fallback=test.get("title")),
            title_fr=self._require_text(test.get("title_fr"), fallback=test.get("title")),
            description=test.get("description"),
            description_ar=test.get("description_ar"),
            description_fr=test.get("description_fr") or test.get("description"),
            topic_id=test.get("topic_id"),
            difficulty=self._enum_or_default(
                QuestionDifficulty, test.get("difficulty"), QuestionDifficulty.MEDIUM
            ),
            default_duration_sec=test.get("default_duration_sec"),
            settings=self._build_template_settings(test),
            is_public=bool(test.get("is_public", True)),
            created_by_id=self.args.staff_id,
        )
        session.add(template)
        await session.flush()
        return template

    def _build_template_settings(self, test: dict[str, Any]) -> dict[str, Any]:
        settings = dict(test.get("settings") or {})
        settings.setdefault("source_test_id", test.get("test_id"))
        settings.setdefault("randomize_questions", True)
        settings.setdefault("randomize_choices", True)
        settings.setdefault("question_count", len(test.get("questions") or []))
        return settings

    async def _create_template_questions(
        self,
        session,
        template: QuizTemplate,
        created_questions: list[tuple[Question, dict[str, Any]]],
    ) -> None:
        ordered = sorted(created_questions, key=lambda item: item[1].get("position") or 0)
        for position, (question, raw) in enumerate(ordered, start=1):
            session.add(
                QuizTemplateQuestion(
                    template_id=template.id,
                    question_id=question.id,
                    position=raw.get("position") or position,
                    duration_sec=self._as_int(raw.get("duration_sec")),
                    is_required=question.is_required,
                    randomize_options=bool(
                        raw.get("randomize_options", template.settings.get("randomize_choices", False))
                    ),
                    estimation_time_seconds=self._as_int(raw.get("estimation_time_seconds")),
                )
            )

    async def _create_quiz(
        self,
        session,
        template: QuizTemplate,
        test: dict[str, Any],
        question_count: int,
    ) -> Quiz:
        settings_payload = template.settings or {}
        quiz_setting = QuizSetting(
            vehicle_type=self.vehicle_type,
            mode=self.quiz_mode,
            question_count=settings_payload.get("question_count", question_count),
            randomize_questions=settings_payload.get("randomize_questions", True),
            randomize_choices=settings_payload.get("randomize_choices", True),
            passing_score=settings_payload.get("passing_score", 21),
            review_allowed=settings_payload.get("review_allowed", True),
        )
        session.add(quiz_setting)
        await session.flush()

        quiz = Quiz(
            school_id=self.args.school_id,
            setting_id=quiz_setting.id,
            template_id=template.id,
            room_id=self.args.room_id,
            is_public=bool(test.get("is_public", False)),
            title_ar=self._require_text(test.get("title_ar"), fallback=test.get("title")),
            title_fr=self._require_text(test.get("title_fr"), fallback=test.get("title")),
            description=test.get("description"),
            starts_at=None,
            ends_at=None,
            created_by_id=self.args.staff_id,
        )
        session.add(quiz)
        return quiz

    @staticmethod
    def _require_text(value: str | None, *, fallback: str | None = None) -> str:
        candidate = (value or fallback or "").strip()
        if not candidate:
            raise ValueError("Localized text value is required but missing")
        return candidate

    @staticmethod
    def _enum_or_default(enum_cls, raw_value: Any, default):
        if raw_value is None:
            return default
        try:
            return enum_cls(str(raw_value).lower())
        except ValueError:
            return default

    @staticmethod
    def _as_int(value: Any) -> int | None:
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None


async def main() -> None:
    args = parse_args()
    importer = QuizDataImporter(args)
    await importer.run()


if __name__ == "__main__":
    asyncio.run(main())
