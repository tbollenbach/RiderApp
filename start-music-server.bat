@echo off
title Rider App Music Server
color 0A

echo.
echo ========================================
echo    RIDER APP MUSIC SERVER
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

:: Check if music-server.js exists
if not exist "music-server.js" (
    echo ERROR: music-server.js not found in current directory
    echo Please run this batch file from the RiderApp directory
    echo.
    pause
    exit /b 1
)

:: Check if package.json exists and install dependencies if needed
if exist "music-server-package.json" (
    echo Installing dependencies...
    npm install express cors multer
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        echo Please check your internet connection and try again
        echo.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

:: Create music directory if it doesn't exist
if not exist "music" (
    echo Creating music directory...
    mkdir music
    echo Music directory created!
    echo.
)

:: Show current IP address
echo Current IP Addresses:
ipconfig | findstr "IPv4"
echo.

:: Start the music server
echo Starting music server...
echo.
echo Server will be available at:
echo - Local: http://localhost:3001
echo - Network: http://YOUR_IP:3001
echo.
echo Press Ctrl+C to stop the server
echo.

node music-server.js

:: If the server stops, wait for user input
echo.
echo Music server stopped.
echo.
pause 