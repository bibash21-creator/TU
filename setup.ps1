# Setup Script for Nova Oracle
Write-Host "--- Setting up Nova Oracle ---" -ForegroundColor Cyan

# Backend Setup
Write-Host "`n[1/2] Setting up Backend..." -ForegroundColor Yellow
cd backend
if (-not (Test-Path .venv)) {
    python -m venv .venv
}
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..

# Frontend Setup
Write-Host "`n[2/2] Setting up Frontend..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

Write-Host "`n--- Setup Complete! ---" -ForegroundColor Green
Write-Host "To run the app, use: ./run.ps1" -ForegroundColor Cyan
