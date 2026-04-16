@echo off
REM Quick Setup Script for Database Issues - Windows
REM Run this when data isn't being saved to the database

setlocal enabledelayedexpansion

echo.
echo ==================================================
echo 🔧 Inventory System Database Setup (Windows)
echo ==================================================
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo ❌ Error: Not in backend directory
    echo    Please run from: project\backend
    echo    Command: cd project\backend
    pause
    exit /b 1
)

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo Step 2: Running database setup...
echo ================================================
node setup-database.js
if errorlevel 1 (
    echo.
    echo ❌ Database setup failed!
    echo.
    echo Common issues:
    echo   1. MySQL is not running
    echo   2. Invalid database credentials
    echo   3. Wrong database name or user/password
    echo.
    echo To fix:
    echo   1. Start MySQL from Services or command line
    echo   2. Verify credentials in models\index.js
    echo   3. Make sure database exists: inventory_db
    echo.
    pause
    exit /b 1
)

echo.
echo ==================================================
echo ✅ Database setup complete!
echo ==================================================
echo.
echo Next steps:
echo.
echo 1. Start the backend server:
echo    Type: npm start
echo    Then press Enter
echo.
echo 2. Open browser and login:
echo    URL: http://localhost:3000
echo    Username: admin
echo    Password: admin123
echo.
echo 3. Try adding a category/unit/item
echo.
echo 4. Verify it was saved to database:
echo    Open new command window and run:
echo    mysql -u root -e "USE inventory_db; SELECT * FROM categories;"
echo.
echo ==================================================
echo.
pause
