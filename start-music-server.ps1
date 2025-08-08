# Rider App Music Server - PowerShell Script
param(
    [switch]$Install,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Rider App Music Server Launcher

Usage:
    .\start-music-server.ps1              # Start the music server
    .\start-music-server.ps1 -Install     # Install dependencies and start
    .\start-music-server.ps1 -Help        # Show this help message

Features:
    - Automatic dependency installation
    - IP address detection
    - Music directory creation
    - Error handling and validation
"@
    exit 0
}

# Set console title and color
$Host.UI.RawUI.WindowTitle = "Rider App Music Server"
$Host.UI.RawUI.ForegroundColor = "Green"

Write-Host @"

========================================
    RIDER APP MUSIC SERVER
========================================

"@ -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if music-server.js exists
if (-not (Test-Path "music-server.js")) {
    Write-Host "ERROR: music-server.js not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from the RiderApp directory" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if requested or if node_modules doesn't exist
if ($Install -or -not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    try {
        npm install express cors multer
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Write-Host "Please check your internet connection and try again" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
}

# Create music directory if it doesn't exist
if (-not (Test-Path "music")) {
    Write-Host "Creating music directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Name "music" -Force | Out-Null
    Write-Host "Music directory created!" -ForegroundColor Green
    Write-Host ""
}

# Get and display IP addresses
Write-Host "Current IP Addresses:" -ForegroundColor Cyan
try {
    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
    foreach ($ip in $ipAddresses) {
        Write-Host "  $($ip.IPAddress)" -ForegroundColor White
    }
} catch {
    Write-Host "  Could not retrieve IP addresses" -ForegroundColor Yellow
}
Write-Host ""

# Start the music server
Write-Host "Starting music server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "- Local: http://localhost:3001" -ForegroundColor White
Write-Host "- Network: http://YOUR_IP:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    node music-server.js
} catch {
    Write-Host ""
    Write-Host "Music server stopped." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
} 