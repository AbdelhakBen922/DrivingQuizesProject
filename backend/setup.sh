#!/bin/bash

# =============================================================================
# Backend Setup Script for Serverless Deployment
# =============================================================================
# This script handles the setup and initialization for the FastAPI backend
# in a serverless environment. It should be run during the build phase.
# =============================================================================

set -e  # Exit on any error

echo "======================================"
echo "Backend Setup - Starting"
echo "======================================"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Python version
print_status "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
REQUIRED_VERSION="3.12"

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 12) else 1)"; then
    print_error "Python ${REQUIRED_VERSION}+ is required. Found: ${PYTHON_VERSION}"
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
print_status "Checking environment variables..."
REQUIRED_VARS=("DATABASE_URL")
OPTIONAL_VARS=("SECRET_KEY" "DATA_DIR_PATH" "BACKEND_URL")

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        exit 1
    fi
    print_status "$var is set ✓"
done

for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "$var is not set (using default)"
    else
        print_status "$var is set ✓"
    fi
done

# Run database migrations
print_status "Running database migrations..."
if [ -f "alembic.ini" ]; then
    # Check if database is reachable
    print_status "Checking database connectivity..."
    python3 -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

async def check_db():
    try:
        engine = create_async_engine(os.environ['DATABASE_URL'])
        async with engine.connect() as conn:
            await conn.execute(text('SELECT 1'))
        print('Database connection successful')
        return True
    except Exception as e:
        print(f'Database connection failed: {e}', file=sys.stderr)
        return False

result = asyncio.run(check_db())
sys.exit(0 if result else 1)
" || {
        print_error "Database is not reachable. Migrations skipped."
        print_warning "Make sure to run 'alembic upgrade head' manually after deployment"
        exit 0
    }

    # Run migrations
    alembic upgrade head
    print_status "Database migrations completed ✓"
else
    print_warning "No alembic.ini found, skipping migrations"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p tmp
print_status "Directories created ✓"

# Verify data directory (if DATA_DIR_PATH is set)
if [ -n "$DATA_DIR_PATH" ]; then
    if [ -d "$DATA_DIR_PATH" ]; then
        print_status "Data directory exists: $DATA_DIR_PATH ✓"
    else
        print_warning "Data directory does not exist: $DATA_DIR_PATH"
        print_warning "Image serving may not work without this directory"
    fi
fi

# Pre-compile Python files for faster startup
print_status "Pre-compiling Python files..."
python3 -m compileall app/ -q
print_status "Python files compiled ✓"

# Health check script
print_status "Creating health check endpoint test..."
python3 -c "
from app.main import app
print('FastAPI app loaded successfully')
" || {
    print_error "Failed to load FastAPI app"
    exit 1
}

print_status "App validation successful ✓"

echo ""
echo "======================================"
echo -e "${GREEN}Backend Setup - Completed Successfully${NC}"
echo "======================================"
echo ""
echo "Next steps for deployment:"
echo "  1. Ensure DATABASE_URL points to your production database"
echo "  2. Set SECRET_KEY to a secure random string"
echo "  3. Configure DATA_DIR_PATH if using static file serving"
echo "  4. Set BACKEND_URL to your deployed backend URL"
echo "  5. Run: uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo ""

exit 0
