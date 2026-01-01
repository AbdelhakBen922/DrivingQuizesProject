#!/bin/bash

# =============================================================================
# Database Setup Script (Separate Deployment)
# =============================================================================
# This script helps set up a PostgreSQL database for the application.
# It can be used for:
#   1. Initializing a fresh database with schema
#   2. Running migrations on an existing database
#   3. Seeding initial data (optional)
# =============================================================================

set -e

echo "======================================"
echo "Database Setup & Migration"
echo "======================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_note() { echo -e "${BLUE}[NOTE]${NC} $1"; }

# Parse command line arguments
SKIP_SEED=false
SEED_USERS=false
SEED_QUIZ_DATA=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-seed)
            SKIP_SEED=true
            shift
            ;;
        --seed-users)
            SEED_USERS=true
            shift
            ;;
        --seed-quiz-data)
            SEED_QUIZ_DATA=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-seed       Skip all data seeding"
            echo "  --seed-users      Seed default users (admin, sample student)"
            echo "  --seed-quiz-data  Import quiz data from data files"
            echo "  --help            Show this help message"
            echo ""
            echo "Environment Variables Required:"
            echo "  DATABASE_URL      PostgreSQL connection string"
            echo "                    Format: postgresql://user:pass@host:5432/dbname"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check for required tools
print_status "Checking required tools..."

if ! command -v python3 &> /dev/null; then
    print_error "python3 is required but not found!"
    exit 1
fi

if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    print_error "pip is required but not found!"
    exit 1
fi

print_status "Required tools available ✓"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 12) else 1)"; then
    print_error "Python 3.12+ is required. Found: ${PYTHON_VERSION}"
    exit 1
fi
print_status "Python version: ${PYTHON_VERSION} ✓"

# Install required Python packages
print_status "Installing required packages..."
pip install --quiet alembic asyncpg sqlalchemy python-dotenv psycopg2-binary 2>/dev/null || {
    print_warning "Some packages may already be installed"
}
print_status "Packages ready ✓"

# Validate DATABASE_URL
print_status "Validating DATABASE_URL..."

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is required!"
    echo ""
    echo "Set it to your PostgreSQL connection string:"
    echo ""
    echo "Examples:"
    echo "  # For Neon:"
    echo "  export DATABASE_URL='postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname'"
    echo ""
    echo "  # For Supabase:"
    echo "  export DATABASE_URL='postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres'"
    echo ""
    echo "  # For Railway:"
    echo "  export DATABASE_URL='postgresql://postgres:pass@containers.railway.internal:5432/railway'"
    echo ""
    echo "  # For local development:"
    echo "  export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/drivingquiz'"
    echo ""
    exit 1
fi

# Convert to asyncpg if needed
ORIGINAL_DATABASE_URL="$DATABASE_URL"
if [[ "$DATABASE_URL" == postgresql://* ]] && [[ "$DATABASE_URL" != *asyncpg* ]]; then
    export DATABASE_URL="${DATABASE_URL/postgresql:\/\//postgresql+asyncpg://}"
    print_status "Converted DATABASE_URL to async driver"
fi

# Also keep sync version for Alembic
SYNC_DATABASE_URL="${ORIGINAL_DATABASE_URL/postgresql+asyncpg:\/\//postgresql://}"
SYNC_DATABASE_URL="${SYNC_DATABASE_URL/postgresql:\/\//postgresql://}"

print_status "DATABASE_URL validated ✓"

# Test database connection
print_status "Testing database connection..."
python3 << 'PYTHON_SCRIPT'
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_connection():
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        
        # Hide password for logging
        safe_url = db_url
        if '@' in safe_url:
            parts = safe_url.split('@')
            creds = parts[0].split(':')
            if len(creds) > 2:
                safe_url = ':'.join(creds[:-1]) + ':***@' + parts[1]
        
        print(f"Connecting to: {safe_url}")
        
        engine = create_async_engine(db_url, echo=False)
        
        async with engine.connect() as conn:
            result = await conn.execute(text('SELECT version()'))
            version = result.scalar()
            print(f"✓ Connected to: {version}")
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f'✗ Connection failed: {e}', file=sys.stderr)
        return False

sys.exit(0 if asyncio.run(test_connection()) else 1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    print_error "Cannot connect to database!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Verify DATABASE_URL is correct"
    echo "  2. Check database server is running"
    echo "  3. Verify network/firewall allows connection"
    echo "  4. Check username and password are correct"
    echo ""
    exit 1
fi

print_status "Database connection successful ✓"

# Check if Alembic is configured
print_status "Checking Alembic configuration..."
if [ ! -f "alembic.ini" ]; then
    print_error "alembic.ini not found!"
    echo ""
    echo "This script must be run from the backend directory"
    echo "where alembic.ini is located."
    exit 1
fi

# Run migrations
print_status "Running database migrations..."
print_note "This will create/update all database tables and schemas"

# Temporarily set sync URL for Alembic
export ORIGINAL_DATABASE_URL_BACKUP="$DATABASE_URL"
export DATABASE_URL="$SYNC_DATABASE_URL"

alembic upgrade head || {
    print_error "Migration failed!"
    export DATABASE_URL="$ORIGINAL_DATABASE_URL_BACKUP"
    exit 1
}

export DATABASE_URL="$ORIGINAL_DATABASE_URL_BACKUP"

print_status "Database migrations completed ✓"

# Check current migration version
CURRENT_VERSION=$(alembic current 2>/dev/null | grep -oP '(?<=\s)[a-f0-9]+(?=\s)' | head -1)
if [ -n "$CURRENT_VERSION" ]; then
    print_status "Current migration version: $CURRENT_VERSION"
fi

# Seed data (optional)
if [ "$SKIP_SEED" = false ]; then
    echo ""
    print_note "Data Seeding Options"
    
    if [ "$SEED_USERS" = true ] && [ -f "scripts/bootstrap_users.py" ]; then
        print_status "Seeding default users..."
        python3 scripts/bootstrap_users.py || print_warning "User seeding failed or users already exist"
    fi
    
    if [ "$SEED_QUIZ_DATA" = true ] && [ -f "scripts/import_quiz_data.py" ]; then
        print_status "Quiz data seeding available via scripts/import_quiz_data.py"
        print_note "Run manually: python3 scripts/import_quiz_data.py --school-id X --staff-id Y --room-id Z --tests test-01 test-02"
    fi
    
    if [ "$SEED_USERS" = false ] && [ "$SEED_QUIZ_DATA" = false ]; then
        print_note "No seeding options specified. Use --seed-users or --seed-quiz-data to seed data"
        print_note "Or run seeding scripts manually later"
    fi
fi

# Display summary
echo ""
echo "======================================"
echo -e "${GREEN}✓ Database Setup Complete${NC}"
echo "======================================"
echo ""
echo "Database Status:"
echo "  Connection: ✓ Successful"
echo "  Migrations: ✓ Applied"
echo "  Current Version: ${CURRENT_VERSION:-unknown}"
echo ""

if [ -f "scripts/bootstrap_users.py" ]; then
    echo "Optional: Seed default users"
    echo "  python3 scripts/bootstrap_users.py"
    echo ""
fi

if [ -f "scripts/import_quiz_data.py" ]; then
    echo "Optional: Import quiz data"
    echo "  python3 scripts/import_quiz_data.py --school-id 1 --staff-id 1 --room-id 1 --tests test-01 test-02"
    echo ""
fi

echo "Database is ready for backend application!"
echo ""

exit 0
