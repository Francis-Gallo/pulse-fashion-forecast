@echo off
echo Starting Pulse...
start cmd /k "cd backend && pip install -r requirements.txt -q && uvicorn main:app --reload"
timeout /t 3
start cmd /k "cd frontend && npm install -q && npm run dev"
echo Pulse is starting at http://localhost:5173
