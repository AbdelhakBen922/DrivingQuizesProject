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

## 6. Running the API

```bash
uvicorn app.main:app --reload
```
Visit `http://127.0.0.1:8000/health` to confirm the service and DB connection are working.

## 7. Project Structure
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

## 8. Common Tasks
- **Install new packages:** `pip install <pkg> && pip freeze > requirements.txt`
- **Format / lint (optional):** add tools like `ruff` or `black` if needed.
- **DB connection test:** `psql postgresql://myuser:mypassword@localhost:5432/drivingquiz -c "SELECT 1;"`

Feel free to extend routers under `app/api/`, schemas in `app/schemas/`, and services in `app/services/` as features evolve.
