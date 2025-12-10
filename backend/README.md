# Driving Quiz Backend

FastAPI + PostgreSQL service powering the Driving Quiz project. This guide walks you through installing dependencies, configuring the database, and running the server locally.

## 1. Prerequisites

Install Python 3.11+, `pip`, and `venv` on your platform of choice:

### Windows (PowerShell)
```powershell
conda create -n senv 
conda activate senv
```


### Debian/Ubuntu
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Install Python Dependencies

From the `backend/` directory and inside the virtual environment:
```bash
pip install -r requirements.txt
```

## 3. PostgreSQL Setup

### Install PostgreSQL
- **Windows:** `winget install -e --id PostgreSQL.PostgreSQL`
- **macOS:** `brew install postgresql`
- **Debian/Ubuntu:** `sudo apt install -y postgresql postgresql-contrib`

### Create Database and User
```bash
psql -U postgres
```
Inside the psql shell run:
```sql
CREATE DATABASE drivingquiz;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE drivingquiz TO myuser;
ALTER DATABASE drivingquiz OWNER TO myuser;          -- optional but keeps ownership consistent
GRANT ALL ON SCHEMA public TO myuser;                -- allow migrations to create tables
ALTER SCHEMA public OWNER TO myuser;                 -- ensures future schema changes succeed
\q
```

## 4. Environment Variables

Copy `.env.example` to `.env` (or edit the provided `.env`) and set the database URL:
```
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/drivingquiz
```

## 5. Database Migrations (Alembic)

Alembic is already listed in `requirements.txt`. Initialize / upgrade as needed:
```bash
alembic init alembic        # first-time only
alembic revision -m "init"
alembic upgrade head
```

> **New:** The latest revision (`a0bb3d7a4102`) embeds room assignments directly on `quizze.room_id` and drops the legacy `room_quizze` join table. Always run `alembic upgrade head` after pulling new code to ensure the schema matches the models.

## 6. Running the API

```bash
uvicorn app.main:app --reload
```
Visit `http://127.0.0.1:8000/health` to confirm the service and DB connection are working.

## 7. Seed Sample Data

Generate deterministic demo entities (plan, school, staff, template, etc.) with the provided script. It safely upserts the same UUIDs, so rerunning is fine when you need to refresh.

```bash
python scripts/seed_data.py
```

If you're using a named Conda environment run `conda run -n <env> python scripts/seed_data.py` instead.

## 8. Endpoint Smoke Tests

After the API server is running, execute the async smoke suite to verify the main CRUD flows stay healthy. The script hits `/health`, schools, students, quiz templates, and template-question routes, failing fast on any non-2xx response.

```bash
python scripts/test_endpoints.py --base-url http://localhost:8000
```

Flags:
- `--base-url`: target service URL (defaults to `API_BASE_URL` env var or `http://localhost:8000`).
- `--timeout`: per-request timeout in seconds (default 10).

Use `conda run -n <env> python ...` if you keep dependencies inside a Conda env. The script prints PASS/FAIL per endpoint and returns exit code 1 on failure, making it suitable for CI or pre-commit checks.

## 9. Project Structure
```
backend/
├── .env
├── requirements.txt
├── README.md
├── alembic/
└── app/
    ├── api/
    ├── core/
    │   └── database.py
    ├── models/
    │   └── models.py
    ├── schemas/
    ├── services/
    └── main.py
```

## 10. API Documentation

FastAPI automatically serves interactive docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Use them to explore schemas, execute requests with custom payloads, and share reproducible examples with teammates when debugging.

## 11. Common Tasks
- **Install new packages:** `pip install <pkg> && pip freeze > requirements.txt`
- **Format / lint (optional):** add tools like `ruff` or `black` if needed.
- **DB connection test:** `psql postgresql://myuser:mypassword@localhost:5432/drivingquiz -c "SELECT 1;"`

Feel free to extend routers under `app/api/`, schemas in `app/schemas/`, and services in `app/services/` as features evolve.

## 12. Authentication & Sample Accounts

Most dashboard and student endpoints require a JWT bearer token. Use the bootstrap script to seed a default owner-level staff user and a demo student:

```bash
python scripts/bootstrap_users.py
```

This creates:

| Role | Username | Password |
| --- | --- | --- |
| Staff (owner) | `admin@example.com` | `admin123` |
| Student | `S1001` | `student123` |

Flow:
1. Call `POST /api/dashboard/auth/login` with the staff credentials to receive a JWT.
2. Send subsequent dashboard requests with `Authorization: Bearer <token>`.
3. Students authenticate via `POST /api/student/auth/login` using their code/password and use the issued token for `/api/student/*` routes.

## 13. Endpoint Overview

Summary of the primary features implemented so far:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/dashboard/auth/login` | Staff authentication (email + password). |
| `POST` | `/api/student/auth/login` | Student authentication (code + password). |
| `GET` | `/api/dashboard/students/` | List students in the current staff member's school. |
| `POST` | `/api/dashboard/students/` | Create a student (auto-hashes password, scopes to staff school). |
| `POST` | `/api/dashboard/staff/` | Create another staff user (owner/admin only). |
| `POST` | `/api/dashboard/rooms/` | Create a room owned by the staff member's school. |
| `DELETE` | `/api/dashboard/rooms/{room_id}` | Remove a room. |
| `POST` | `/api/dashboard/rooms/{room_id}/members` | Add/activate a student in the room. |
| `DELETE` | `/api/dashboard/rooms/{room_id}/members/{student_id}` | Soft-remove a student (status `REMOVED`). |
| `POST` | `/api/dashboard/rooms/{room_id}/quizzes` | Publish a quiz to the room (prevents duplicates). |
| `DELETE` | `/api/dashboard/rooms/{room_id}/quizzes/{quiz_id}` | Unpublish a quiz from the room. |
| `GET` | `/api/dashboard/quizzes/` | List quizzes belonging to the staff member's school (filterable by room/template). |
| `POST` | `/api/dashboard/quizzes/` | Create a quiz tied to a room + template in one call (auto-creates settings). |
| `GET` | `/api/student/rooms/` | Authenticated student room list (pending full implementation). |
| `GET` | `/api/student/quizzes/` | Authenticated student quiz list (pending full implementation). |

All dashboard routes share the same staff JWT guard via `get_current_staff`, ensuring school isolation. Student routes use `get_current_student`, so even the current stubs already enforce authentication while you continue iterating on the business logic.

## 14. Dashboard Quiz Creation Walkthrough

Creating a quiz for a cohort now happens through a single dashboard endpoint that simultaneously:

1. Validates the room and template belong to the current staff member's school.
2. Spins up a dedicated `QuizSetting` record from your payload.
3. Persists the quiz with `room_id`, `template_id`, and optional scheduling metadata.

Example request:

```http
POST /api/dashboard/quizzes/
Authorization: Bearer <staff-token>
Content-Type: application/json

{
    "title": "Morning Cohort Drill",
    "description": "10-question warmup from the priority rules template",
    "template_id": 12,
    "room_id": 5,
    "starts_at": "2025-12-12T08:00:00Z",
    "ends_at": "2025-12-12T09:00:00Z",
    "is_public": false,
    "settings": {
        "vehicle_type": "car",
        "mode": "training",
        "question_count": 10,
        "randomize_questions": true,
        "randomize_choices": true,
        "passing_score": 8,
        "review_allowed": true
    }
}
```

The response echoes the saved quiz plus its nested setting and template, so the dashboard can immediately render the assignment card.
