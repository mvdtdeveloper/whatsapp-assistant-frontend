@echo off
setlocal

echo ============================================
echo MVDT Field Assistant - Capacitor Android Setup
echo ============================================

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 goto :error

echo [2/5] Building React application...
call npm run build
if errorlevel 1 goto :error

if not exist android (
  echo [3/5] Creating Android project...
  call npx cap add android
  if errorlevel 1 goto :error
) else (
  echo [3/5] Android project already exists.
)

echo [4/5] Syncing web build to Android...
call npx cap sync android
if errorlevel 1 goto :error

echo [5/5] Opening Android Studio...
call npx cap open android
if errorlevel 1 goto :error

echo Done.
exit /b 0

:error
echo.
echo Setup failed. Check Node.js 22+, internet access, and Android Studio installation.
exit /b 1
