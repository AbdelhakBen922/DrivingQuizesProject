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
COPY backend/requirements.txt backend/pyproject.toml* ./

# Install Python dependencies (like setup.sh does)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the entire backend application
COPY backend/ .

# Copy quiz images from root data folder
COPY data/ ./data

# Create necessary directories
RUN mkdir -p logs tmp uploads

# Expose the port
EXPOSE 8080
# Run setup.sh and then start the application
CMD bash setup.sh && uvicorn app.main:app --host 0.0.0.0 --port 8080
