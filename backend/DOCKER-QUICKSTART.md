# =============================================================================
# Docker Quick Start Guide
# =============================================================================

## 🚀 Start Everything

```bash
cd backend

# Start both database and backend
docker-compose up

# Or run in background (detached mode)
docker-compose up -d
```

## 📊 What Happens:

1. **PostgreSQL starts** on port 5433
2. **Backend waits** for database to be healthy
3. **Migrations run** automatically (alembic upgrade head)
4. **FastAPI starts** on port 8001 with hot-reload

Access your API at: **http://localhost:8001**

## 🛠️ Common Commands

```bash
# View logs (follow mode)
docker-compose logs -f backend

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Run bootstrap script
docker-compose exec backend python3 scripts/bootstrap_users.py

# Import quiz data
docker-compose exec backend python3 scripts/import_quiz_data.py \
  --school-id 1 --staff-id 10 --room-id 4 --tests test-01 test-02

# Connect to database
docker-compose exec db psql -U postgres -d drivingquiz

# Shell into backend
docker-compose exec backend bash
```

## 🔧 Ports

- **Backend API**: http://localhost:8001
- **Database**: localhost:5433
- **Health Check**: http://localhost:8001/health

## 🗄️ Data Persistence

- Database data is stored in Docker volume `postgres_data`
- Quiz images are mounted from `/home/abdelhak/Desktop/Study/Y3S1/SWE/DrivingQuizesProject/data`
- Logs are in `./logs`

## 🐛 Troubleshooting

**Backend won't start?**
```bash
docker-compose logs backend
```

**Database issues?**
```bash
docker-compose exec db pg_isready -U postgres
```

**Need to restart?**
```bash
docker-compose restart backend
```

**Clean start (⚠️ deletes database data)?**
```bash
docker-compose down -v
docker-compose up
```
