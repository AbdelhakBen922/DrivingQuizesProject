#!/bin/bash

# =============================================================================
# Backend Application Setup Script (Serverless Deployment)
# =============================================================================
# This script prepares the FastAPI backend for serverless deployment.
# Database must be deployed separately and DATABASE_URL must be provided.
# =============================================================================

set -e  # Exit on any error

echo "======================================"
echo "Backend Application Setup"
echo "======================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check Python version
print_status "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 12) else 1)"; then
    print_error "Python 3.12+ is required. Found: ${PYTHON_VERSION}"
    exit 1
fi
print_status "Python version: ${PYTHON_VERSION} ✓"

# Install dependencies
print_status "Installing Python dependencies..."
if [ -f "requirements.txt" ]; then
    pip install --no-cache-dir -r requirements.txt
    print_status "Dependencies installed from requirements.txt ✓"
elif [ -f "pyproject.toml" ]; then
    pip install --no-cache-dir -e .
    print_status "Dependencies installed from pyproject.toml ✓"
else
    print_error "No requirements.txt or pyproject.toml found!"
    exit 1
fi

# Verify critical environment variables
print_status "Validating environment variables..."

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL is required but not set!"
    echo ""
    echo "Your database should be deployed separately using setup-database.sh"
    echo "Then set DATABASE_URL in your serverless platform."
    echo ""
    echo "Format: postgresql+asyncpg://user:pass@host:5432/dbname"
    exit 1
fi

# Ensure asyncpg driver
if [[ "$DATABASE_URL" == postgresql://* ]] && [[ "$DATABASE_URL" != *asyncpg* ]]; then
    export DATABASE_URL="${DATABASE_URL/postgresql:\/\//postgresql+asyncpg://}"
    print_status "Auto-converted DATABASE_URL to use asyncpg driver"
fi

# Validate DATABASE_URL format
if [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
    print_error "DATABASE_URL contains localhost/127.0.0.1!"
    echo ""
    echo "In serverless deployment, database must be on a separate host."
    echo "Deploy your database first using setup-database.sh"
    exit 1
fi

print_status "DATABASE_URL is set and valid ✓"

# Check optional environment variables
[ -z "$SECRET_KEY" ] && print_warning "SECRET_KEY not set - using default (NOT SECURE for production!)"
[ -z "$DATA_DIR_PATH" ] && print_warning "DATA_DIR_PATH not set - using default: data"
[ -z "$BACKEND_URL" ] && print_warning "BACKEND_URL not set - using default: http://localhost:8001"

# Test database connectivity
print_status "Testing database connection..."
python3 << 'PYTHON_SCRIPT'
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_db():
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if 'postgresql://' in db_url and 'asyncpg' not in db_url:
            db_url = db_url.replace('postgresql://', 'postgresql+asyncpg://')
        
        # Hide password in logs
        safe_url = db_url.split('@')[0].split(':')[:-1]
        safe_url = ':'.join(safe_url) + ':***@' + db_url.split('@')[1] if '@' in db_url else 'invalid'
        print(f"Connecting to: {safe_url}")
        
        engine = create_async_engine(
            db_url, 
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            echo=False
        )
        
        async with engine.connect() as conn:
            await conn.execute(text('SELECT 1'))
        
        await engine.dispose()
        print('✓ Database connection successful')
        return True
        
    except Exception as e:
        error_msg = str(e)
        print(f'✗ Database connection failed: {error_msg}', file=sys.stderr)
        
        if 'Connect call failed' in error_msg or 'Connection refused' in error_msg:
            print('', file=sys.stderr)
            print('DATABASE CONNECTION ERROR:', file=sys.stderr)
            print('  - Database service may not be running', file=sys.stderr)
            print('  - Check hostname/port in DATABASE_URL', file=sys.stderr)
            print('  - Verify firewall rules allow connection', file=sys.stderr)
        elif 'No address' in error_msg or 'not known' in error_msg:
            print('', file=sys.stderr)
            print('HOSTNAME RESOLUTION ERROR:', file=sys.stderr)
            print('  - Database hostname cannot be resolved', file=sys.stderr)
            print('  - Verify DATABASE_URL hostname is correct', file=sys.stderr)
        elif 'authentication failed' in error_msg.lower() or 'password' in error_msg.lower():
            print('', file=sys.stderr)
            print('AUTHENTICATION ERROR:', file=sys.stderr)
            print('  - Username or password is incorrect', file=sys.stderr)
            print('  - Check credentials in DATABASE_URL', file=sys.stderr)
        
        return False

sys.exit(0 if asyncio.run(check_db()) else 1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    print_error "Cannot connect to database!"
    echo ""
    echo "TROUBLESHOOTING:"
    echo "  1. Deploy database first using setup-database.sh"
    echo "  2. Verify DATABASE_URL in environment variables"
    echo "  3. Check database service is running and accessible"
    echo ""
    exit 1
fi

print_status "Database connection verified ✓"

# Run database migrations
print_status "Running database migrations..."
if [ -f "alembic.ini" ]; then
    alembic upgrade head || {
        print_error "Database migrations failed!"
        exit 1
    }
    print_status "Database migrations completed ✓"
else
    print_warning "No alembic.ini found - skipping migrations"
fi

# Create necessary directories
print_status "Creating application directories..."
mkdir -p logs tmp
print_status "Directories created ✓"

# Handle data directory for static files
DATA_PATH="${DATA_DIR_PATH:-data}"
if [ -d "$DATA_PATH" ]; then
    print_status "Data directory exists: $DATA_PATH ✓"
    FILE_COUNT=$(find "$DATA_PATH" -type f 2>/dev/null | wc -l)
    print_status "Found $FILE_COUNT files in data directory"
else
    print_warning "Data directory not found: $DATA_PATH"
    print_status "Creating empty data directory..."
    mkdir -p "$DATA_PATH"
    print_warning "Note: Upload quiz images to $DATA_PATH if needed"
fi

# Pre-compile Python bytecode for faster cold starts
print_status "Pre-compiling Python files for faster startup..."
python3 -m compileall app/ -q 2>/dev/null || true
print_status "Python bytecode compiled ✓"

# Validate FastAPI application loads
print_status "Validating FastAPI application..."
python3 -c "
from app.main import app
from app.core.config import settings
print('✓ FastAPI app loaded successfully')
print(f'  App name: {settings.app_name}')
" || {
    print_error "Failed to load FastAPI application!"
    exit 1
}

print_status "Application validation successful ✓"

# Display configuration summary
echo ""
echo "======================================"
echo -e "${GREEN}✓ Backend Setup Complete${NC}"
echo "======================================"
echo ""
echo "Configuration Summary:"
echo "  Python: ${PYTHON_VERSION}"
echo "  Database: Connected ✓"
echo "  Migrations: Applied ✓"
echo "  Data directory: ${DATA_PATH}"
echo ""
echo "Environment Variables:"
echo "  DATABASE_URL: [SET] ✓"
echo "  SECRET_KEY: $([ -n "$SECRET_KEY" ] && echo '[SET] ✓' || echo '[DEFAULT] ⚠️')"
echo "  DATA_DIR_PATH: ${DATA_DIR_PATH:-[DEFAULT: data]}"
echo "  BACKEND_URL: ${BACKEND_URL:-[DEFAULT: http://localhost:8001]}"
echo ""
echo "Ready to start server!"
echo "Run: uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
echo ""

exit 0
