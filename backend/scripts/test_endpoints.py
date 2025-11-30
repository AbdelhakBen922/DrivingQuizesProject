from __future__ import annotations

import argparse
import asyncio
import os
import sys
import uuid
from dataclasses import dataclass
from datetime import date
from typing import Any, Awaitable, Callable

import httpx


@dataclass
class TestResult:
    name: str
    ok: bool
    detail: str


Formatter = Callable[[Any], str]


def build_school_payload() -> dict[str, Any]:
    suffix = uuid.uuid4().hex[:6]
    return {
        "name": f"API Test Driving School {suffix}",
        "legal_name": f"API Test Driving School LLC {suffix}",
        "registration_number": f"RN-{suffix}",
        "address": "123 Example Street",
        "phone": "+1-202-555-0101",
        "email": f"school-{suffix}@example.com",
        "timezone": "UTC",
        "locale": "en-US",
        "language_defaults": "en",
        "settings": {"default_room_duration": 90},
        "billing_info": {"contact": "QA Bot"},
    }


def build_student_payload(school_id: str) -> dict[str, Any]:
    suffix = uuid.uuid4().hex[:5]
    return {
        "school_id": school_id,
        "full_name": f"API Test Student {suffix}",
        "dob": date(2000, 1, 1).isoformat(),
        "student_code": f"CODE-{suffix}".upper(),
        "phone": "+1-202-555-0199",
        "email": f"student-{suffix}@example.com",
        "profile_data": {"source": "endpoint-smoke"},
    }


def build_quiz_template_payload(school_id: str) -> dict[str, Any]:
    suffix = uuid.uuid4().hex[:4]
    return {
        "school_id": school_id,
        "title": f"API Smoke Quiz {suffix}",
        "description": "Automatically generated via endpoint test script",
        "total_time_seconds": 900,
        "settings": {"passing_score": 80, "shuffle_questions": True},
        "visibility": "private",
    }


def build_question_payload(school_id: str) -> dict[str, Any]:
    return {
        "school_id": school_id,
        "category": "traffic_signs",
        "difficulty": "easy",
        "question_text": "What does a red octagon sign indicate?",
        "options": [
            {"id": "A", "text": "Stop"},
            {"id": "B", "text": "Yield"},
            {"id": "C", "text": "No parking"},
            {"id": "D", "text": "Speed bump"},
        ],
        "correct_option_ids": ["A"],
        "is_multiple_choice": False,
        "score": 5,
        "tags": ["api-smoke", "signs"],
        "explanation": "A red octagon always means stop.",
    }


async def request_json(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    *,
    expected_status: int = 200,
    **kwargs: Any,
) -> Any:
    response = await client.request(method, url, **kwargs)
    if response.status_code != expected_status:
        raise RuntimeError(
            f"{method} {url} expected {expected_status} but received "
            f"{response.status_code}: {response.text}"
        )
    if not response.content:
        return None
    return response.json()


async def record_result(
    results: list[TestResult],
    name: str,
    coroutine_factory: Callable[[], Awaitable[Any]],
    formatter: Formatter | None = None,
) -> tuple[bool, Any | None]:
    try:
        payload = await coroutine_factory()
        detail = formatter(payload) if formatter else ""
        results.append(TestResult(name=name, ok=True, detail=detail))
        return True, payload
    except Exception as exc:  # noqa: BLE001 - want the exact reason surfaced
        results.append(TestResult(name=name, ok=False, detail=str(exc)))
        return False, None


async def run_suite(base_url: str, timeout: float) -> tuple[list[TestResult], bool]:
    results: list[TestResult] = []
    async with httpx.AsyncClient(base_url=base_url.rstrip("/"), timeout=timeout) as client:
        ok, _ = await record_result(
            results,
            "GET /health",
            lambda: request_json(client, "GET", "/health"),
            formatter=lambda data: f"status={data.get('status')}" if data else "",
        )
        if not ok:
            return results, False

        ok, school = await record_result(
            results,
            "POST /api/schools",
            lambda: request_json(client, "POST", "/api/schools/", json=build_school_payload(), expected_status=201),
            formatter=lambda data: f"id={data['id']} name={data['name']}",
        )
        if not ok or not school:
            return results, False

        await record_result(
            results,
            "GET /api/schools",
            lambda: request_json(client, "GET", "/api/schools/"),
            formatter=lambda data: f"count={len(data)}",
        )

        ok, student = await record_result(
            results,
            "POST /api/students",
            lambda: request_json(
                client,
                "POST",
                "/api/students/",
                json=build_student_payload(school_id=school["id"]),
                expected_status=201,
            ),
            formatter=lambda data: f"id={data['id']} code={data['student_code']}",
        )
        if not ok:
            return results, False

        await record_result(
            results,
            "GET /api/students",
            lambda: request_json(
                client,
                "GET",
                "/api/students/",
                params={"school_id": school["id"]},
            ),
            formatter=lambda data: f"count={len(data)} for school",
        )

        ok, template = await record_result(
            results,
            "POST /api/quiz-templates",
            lambda: request_json(
                client,
                "POST",
                "/api/quiz-templates/",
                json=build_quiz_template_payload(school_id=school["id"]),
                expected_status=201,
            ),
            formatter=lambda data: f"id={data['id']} title={data['title']}",
        )
        if not ok or not template:
            return results, False

        await record_result(
            results,
            "GET /api/quiz-templates",
            lambda: request_json(
                client,
                "GET",
                "/api/quiz-templates/",
                params={"school_id": school["id"]},
            ),
            formatter=lambda data: f"count={len(data)} for school",
        )

        await record_result(
            results,
            "POST /api/quiz-templates/{id}/questions",
            lambda: request_json(
                client,
                "POST",
                f"/api/quiz-templates/{template['id']}/questions/",
                json={
                    "question": build_question_payload(school_id=school["id"]),
                    "randomize_options": True,
                    "estimation_time_seconds": 60,
                },
                expected_status=201,
            ),
            formatter=lambda data: f"id={data['id']} order={data['question_order']}",
        )

        await record_result(
            results,
            "GET /api/quiz-templates/{id}/questions",
            lambda: request_json(
                client,
                "GET",
                f"/api/quiz-templates/{template['id']}/questions/",
            ),
            formatter=lambda data: f"count={len(data)}",
        )

    all_passed = all(item.ok for item in results)
    return results, all_passed


def print_summary(results: list[TestResult]) -> None:
    if not results:
        print("No tests were executed.")
        return

    name_width = max(len(result.name) for result in results)
    for result in results:
        status = "PASS" if result.ok else "FAIL"
        detail = f" - {result.detail}" if result.detail else ""
        print(f"{status:<4} {result.name.ljust(name_width)}{detail}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run simple HTTP checks against the FastAPI backend")
    parser.add_argument(
        "--base-url",
        default=os.environ.get("API_BASE_URL", "http://localhost:8000"),
        help="Base URL of the running API service",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=float(os.environ.get("API_TEST_TIMEOUT", 10)),
        help="Per-request timeout in seconds",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    results, all_passed = asyncio.run(run_suite(args.base_url, args.timeout))
    print_summary(results)
    if not all_passed:
        sys.exit(1)


if __name__ == "__main__":
    main()
