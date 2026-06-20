@echo off
cd /d "%~dp0"

:: Ensure Node.js is in PATH
where node >nul 2>nul
if errorlevel 1 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else (
        echo [ERROR] Node.js not found. Please install Node.js from https://nodejs.org/
        pause
        exit /b 1
    )
)

:: Ensure pnpm is in PATH
where pnpm >nul 2>nul
if errorlevel 1 (
    if exist "%APPDATA%\npm\pnpm.cmd" (
        set "PATH=%APPDATA%\npm;%PATH%"
    ) else (
        echo Installing pnpm via npm...
        call npm install -g pnpm
        if errorlevel 1 (
            echo [ERROR] Failed to install pnpm.
            pause
            exit /b 1
        )
        set "PATH=%APPDATA%\npm;%PATH%"
    )
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call pnpm install
    if errorlevel 1 (
        echo [ERROR] pnpm install failed.
        pause
        exit /b 1
    )
)

set PORT=3000
set BASE_PATH=/
set WS_PORT=3001

:: Start WebSocket server in background
echo Starting WebSocket server on port %WS_PORT%...
start "occult-child-ws" cmd /c "pnpm run server"

echo Starting dev server at http://localhost:%PORT%
call pnpm run dev
pause