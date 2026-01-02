# 🚀 Render.com Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Render.com account (free tier available)

## 📋 Deployment Steps

### Option 1: Using render.yaml (Blueprint - Recommended)

1. **Push your code to GitHub**
   ```bash
   cd /home/abdelhak/Desktop/Study/Y3S1/SWE/DrivingQuizesProject
   git add .
   git commit -m "Add Render deployment config"
   git push origin feature/dockerization_backend
   ```

2. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New" → "Blueprint"

3. **Connect Repository**
   - Select your GitHub repository: `DrivingQuizesProject`
   - Branch: `feature/dockerization_backend` (or `main`)
   - Render will auto-detect `backend/render.yaml`

4. **Deploy**
   - Click "Apply"
   - Render will:
     - Create PostgreSQL database
     - Build Docker image
     - Run migrations
     - Start your service

5. **Done!** 🎉
   - Your API will be at: `https://drivingquiz-backend.onrender.com`
   - Health check: `https://drivingquiz-backend.onrender.com/health`
   - Docs: `https://drivingquiz-backend.onrender.com/docs`

---

### Option 2: Manual Setup (More Control)

#### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click "New" → "PostgreSQL"
2. Configuration:
   - **Name**: `drivingquiz-postgres`
   - **Database**: `drivingquiz`
   - **User**: `postgres`
   - **Region**: Choose closest to you
   - **Plan**: Free
3. Click "Create Database"
4. **Save the Internal Database URL** (starts with `postgresql://`)

#### Step 2: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configuration:

   **Basic Settings:**
   - **Name**: `drivingquiz-backend`
   - **Region**: Same as database
   - **Branch**: `feature/dockerization_backend` (or `main`)
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile.render`

   **Instance:**
   - **Plan**: Free (or Starter $7/month for better performance)

   **Environment Variables:**
   Click "Add Environment Variable" for each:
   
   ```
   DATABASE_URL = [Paste your PostgreSQL Internal URL from Step 1]
   SECRET_KEY = [Generate a random 64-character string]
   DATA_DIR_PATH = /app/data
   BACKEND_URL = https://drivingquiz-backend.onrender.com
   PORT = 8001
   ```

   **Advanced:**
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes

4. Click "Create Web Service"

#### Step 3: Wait for Deployment

- Render will:
  1. Clone your repository
  2. Build the Docker image (2-5 minutes)
  3. Run migrations
  4. Seed initial data
  5. Start the server

- Monitor logs in real-time in the Render dashboard

#### Step 4: Verify Deployment

```bash
# Check health
curl https://drivingquiz-backend.onrender.com/health

# View API docs
open https://drivingquiz-backend.onrender.com/docs

# Test login
curl -X POST https://drivingquiz-backend.onrender.com/api/dashboard/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 🔧 Post-Deployment Setup

### Import Quiz Data

```bash
# Connect to your deployed backend (using Render shell)
# In Render Dashboard → Select your service → Shell tab

python scripts/import_quiz_data.py --school-id 1 --staff-id 1 --room-id 1
```

Or use Render's API:
```bash
curl -X POST https://drivingquiz-backend.onrender.com/api/admin/import-quizzes \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📊 Database Management

### Access PostgreSQL Database

**Using Render Dashboard:**
- Go to your database → "Connect" tab
- Use the connection string with any PostgreSQL client

**Using psql:**
```bash
psql postgresql://username:password@hostname/database
```

### Run Migrations Manually

```bash
# In Render Shell
alembic upgrade head
```

### Backup Database

```bash
# Download backup from Render Dashboard
# Database → Backups tab
```

---

## 🔍 Troubleshooting

### Service Won't Start

1. **Check Logs**: Render Dashboard → Logs tab
2. **Common Issues**:
   - Database not ready: Wait 1-2 minutes after DB creation
   - Wrong DATABASE_URL: Check it starts with `postgresql://` not `postgres://`
   - Missing dependencies: Verify `requirements.txt` is complete

### Fix DATABASE_URL Format

If you see asyncpg errors, ensure DATABASE_URL uses sync driver for migrations:
```bash
# In Environment Variables, update:
DATABASE_URL = postgresql://user:pass@host/db  # NOT postgresql+asyncpg://
```

The app will auto-convert for async operations.

### Health Check Failing

- Verify `/health` endpoint works locally first
- Check `PORT` environment variable is set to `8001`
- Ensure Dockerfile exposes port `8001`

### Slow Performance on Free Tier

- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to Starter plan ($7/month) for always-on

---

## 🌐 Connect Frontend

Update your frontend `.env`:

```env
VITE_API_URL=https://drivingquiz-backend.onrender.com
```

---

## 💰 Pricing

**Free Tier:**
- ✅ 750 hours/month (enough for 1 service)
- ✅ Free PostgreSQL (90-day data retention)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM

**Starter ($7/month per service):**
- ✅ Always on
- ✅ 512 MB RAM
- ✅ Better performance

**PostgreSQL ($7/month):**
- ✅ Always on
- ✅ Daily backups
- ✅ High availability

---

## 🎯 Best Practices

1. **Use Environment Variables** - Never hardcode secrets
2. **Enable Auto-Deploy** - Automatic deployments on git push
3. **Monitor Logs** - Check logs regularly for errors
4. **Set Up Alerts** - Configure Render notifications
5. **Regular Backups** - Download database backups weekly

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Docker Deployments](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created
- [ ] Web service created and deployed
- [ ] Environment variables configured
- [ ] Health check passing
- [ ] Initial data seeded
- [ ] API documentation accessible
- [ ] Login endpoints working
- [ ] Frontend connected

Your backend is now live on Render! 🚀
