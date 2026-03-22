# Launch Script for Nova Oracle
Write-Host "--- Launching Nova Oracle ---" -ForegroundColor Cyan

# Start Backend in a new window
Write-Host "Starting Backend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; .\.venv\Scripts\Activate.ps1; python main.py"

# Start Frontend in current window (or new)
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd frontend; npm run dev"

Write-Host "`n--- Services are starting! ---" -ForegroundColor Green
Write-Host "Backend: http://localhost:9099" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:9099/docs" -ForegroundColor Gray
