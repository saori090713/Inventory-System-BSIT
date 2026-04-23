@echo off
REM ===== Inventory Management System - Auto Start Script =====
REM This batch file automatically starts both backend and frontend servers

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Inventory Management System - Auto Startup            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  WARNING: .env file not found!
    echo.
    echo Please follow these steps:
    echo 1. Copy .env.example to .env
    echo 2. Edit .env with your database credentials
    echo 3. Create the database: mysql -u root -p -e "CREATE DATABASE inventory_db;"
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✓ Detected .env file
echo.

REM Check if node_modules exist in backend
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

REM Check if node_modules exist in frontend
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo ✓ Starting services...
echo.

REM Start backend server in new window
echo 🚀 Launching Backend Server (Port 5000)...
start "Inventory Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak



echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  ✓ Both services are starting...                       ║
echo ║                                                        ║
echo ║  Backend:  http://localhost:5000                       ║
echo ║                                                        ║
echo ║  Login Page:                                           ║
echo ║  http://localhost:5000/pages/login.html                ║
echo ║                                                        ║
echo ║  Default Credentials:                                  ║
echo ║  Username: admin                                       ║
echo ║  Password: admin123                                    ║
echo ║                                                        ║
echo ║  Press Ctrl+C in each terminal window to stop          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Give user option to open browser
setlocal enabledelayedexpansion
set /p openBrowser="Do you want to open the login page in your browser? (y/n): "
if /i "!openBrowser!"=="y" (
    echo Opening browser...
    timeout /t 2 /nobreak
    start http://127.0.0.1:5000/pages/login.html
)

echo.
echo ℹ️  Main window can now be closed. Services continue running in separate terminals.
echo.
pause
