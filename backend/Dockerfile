# Native Dockerfile for deploying the backend on Render or Railway with full system dependencies
FROM python:3.11-slim

# Install system dependencies, including Tesseract OCR natively
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory inside the container
WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the rest of the backend files
COPY . .

# Run Uvicorn via Gunicorn (Production standard for FastAPI)
# We map directly to $PORT which is exposed by the hosting provider automatically
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-9099}"]
