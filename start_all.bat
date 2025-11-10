@echo off
title Reelio Full Stack Launcher
echo ==================================================
echo              🚀 Starting Reelio App
echo ==================================================

REM === STEP 1: START OLLAMA SERVER ===
echo.
echo [1/5] Starting Ollama server...
start "" cmd /k "ollama serve"

REM === STEP 2: START FASTAPI BACKEND (with venv) ===
echo.
echo [2/5] Starting FastAPI backend...
cd Backend

REM Activate virtual environment and run server
call venv\Scripts\activate
start "" cmd /k "call venv\Scripts\activate && uvicorn server:app --reload"

cd ..

REM === STEP 3: START NEXT.JS FRONTEND ===
echo.
echo [3/5] Starting Next.js frontend...
cd Frontend
start "" cmd /k "npm run dev"
cd ..

REM === STEP 4: LAUNCH LM STUDIO AND LOAD MODEL ===
echo.
echo [4/5] Launching LM Studio with Orpheus model...
REM Update the path if your LM Studio is installed elsewhere
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\LM Studio\LM Studio.exe"
timeout /t 10 >nul
echo (Please ensure 'orpheus-3b-0.1-ft' is loaded in LM Studio.)

REM === STEP 5: OPEN LOCAL APP IN BROWSER ===
echo.
echo [5/5] Opening Reelio in browser...
start "" http://localhost:3000

echo.
echo ==================================================
echo ✅ All systems started successfully!
echo ==================================================
pause
