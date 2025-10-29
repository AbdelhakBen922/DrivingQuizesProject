# Docker Setup Guide

This project uses Docker and Docker Compose to run both the frontend and backend services.

## Architecture

- **Frontend**: React/Remix application (Node.js 20)
- **Backend**: Laravel API (PHP 8.2-FPM + Nginx)
- **Database**: MySQL 8.0
- **Cache/Queue**: Redis 7
- **Database Management**: PhpMyAdmin (optional)

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB of available RAM

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository (if not already done)
cd DrivingQuizesProject

# Copy environment file for backend
cp backend/.env.docker backend/.env

# Generate Laravel application key
docker compose run --rm backend php artisan key:generate
```

### 2. Build and Start Services

```bash
# Build all containers
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

### 3. Initialize Database

```bash
# Run migrations
docker compose exec backend php artisan migrate

# Seed database (if you have seeders)
docker compose exec backend php artisan db:seed

# Or run both together
docker compose exec backend php artisan migrate --seed
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **PhpMyAdmin**: http://localhost:8080
  - Username: `laravel_user`
  - Password: `laravel`

## Common Commands

### Service Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a specific service
docker compose restart backend

# View service logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after code changes
docker compose up -d --build
```

### Backend (Laravel) Commands

```bash
# Run artisan commands
docker compose exec backend php artisan migrate
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:list

# Run composer commands
docker compose exec backend composer install
docker compose exec backend composer update

# Access backend shell
docker compose exec backend sh

# Run tests
docker compose exec backend php artisan test
```

### Database Commands

```bash
# Access MySQL CLI
docker compose exec db mysql -u laravel_user -p
# Password: laravel_password

# Backup database
docker compose exec db mysqldump -u laravel_user -p driving_quiz > backup.sql

# Restore database
docker compose exec -T db mysql -u laravel_user -p driving_quiz < backup.sql

# Access Redis CLI
docker compose exec redis redis-cli
```

### Frontend Commands

```bash
# Access frontend shell
docker compose exec frontend sh

# Run npm commands (if needed)
docker compose exec frontend npm install
docker compose exec frontend npm run build
```

## Development Workflow

### For Backend Development

1. Make changes to Laravel code in `./backend`
2. The changes are reflected via volume mounts (for storage/logs)
3. For code changes, rebuild the container:
   ```bash
   docker compose up -d --build backend
   ```

### For Frontend Development

1. Make changes to React/Remix code in `./frontend`
2. Rebuild the container:
   ```bash
   docker compose up -d --build frontend
   ```

## Troubleshooting

### Container won't start

```bash
# Check container status
docker compose ps

# View detailed logs
docker compose logs backend
docker compose logs frontend

# Check if ports are already in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Permission Issues (Linux/Mac)

```bash
# Fix storage permissions
docker compose exec backend chown -R www-data:www-data /var/www/html/storage
docker compose exec backend chmod -R 755 /var/www/html/storage
```

### Database Connection Issues

```bash
# Check if database is ready
docker compose exec db mysql -u laravel_user -p -e "SELECT 1"

# Restart database
docker compose restart db

# Check backend .env configuration
docker compose exec backend cat .env | grep DB_
```

### Clear All Data and Start Fresh

```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Remove all built images
docker compose down --rmi all

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

## Production Deployment

### Security Checklist

1. ✅ Change all default passwords in `docker-compose.yml`
2. ✅ Set `APP_DEBUG=false` in backend `.env`
3. ✅ Generate a strong `APP_KEY`
4. ✅ Use environment variables for sensitive data
5. ✅ Disable PhpMyAdmin in production (remove from compose file)
6. ✅ Configure proper SSL/TLS certificates
7. ✅ Set up firewall rules
8. ✅ Enable Redis password authentication

### Environment Variables

Create a `.env` file in the root directory for production:

```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_PASSWORD=your_secure_password

# Laravel
APP_KEY=your_generated_app_key
```

Then update `docker-compose.yml` to use these variables:

```yaml
environment:
  MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

## Performance Optimization

### Laravel Optimizations

```bash
# Cache configuration
docker compose exec backend php artisan config:cache

# Cache routes
docker compose exec backend php artisan route:cache

# Cache views
docker compose exec backend php artisan view:cache

# Optimize autoloader
docker compose exec backend composer dump-autoload -o
```

### Database Optimizations

- Adjust MySQL buffer pool size in `backend/docker/mysql/my.cnf`
- Monitor slow query log
- Add appropriate indexes

## Monitoring

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Backup Strategy

### Automated Backup Script

Create a `backup.sh` script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db mysqldump -u laravel_user -plaravel driving_quiz > "backups/db_backup_${DATE}.sql"
tar -czf "backups/storage_backup_${DATE}.tar.gz" ./backend/storage/app
```

## Support

For issues or questions:
- Check the [Docker documentation](https://docs.docker.com/)
- Check the [Laravel documentation](https://laravel.com/docs)
- Review container logs: `docker compose logs`
