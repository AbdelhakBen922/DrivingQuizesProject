# =============================================================================
# Dockerfile for FastAPI Backend
# =============================================================================
# This replicates your local setup.sh + uvicorn workflow in a container
# =============================================================================

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (like setup.sh does)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first (for Docker layer caching)
COPY requirements.txt pyproject.toml* ./

# Install Python dependencies (like setup.sh does)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the entire application
COPY . .

# Create necessary directories
RUN mkdir -p logs tmp data

# Expose the port (8001 as you use locally)
EXPOSE 8001

# The command will be provided by docker-compose
# This allows flexibility for development vs production
