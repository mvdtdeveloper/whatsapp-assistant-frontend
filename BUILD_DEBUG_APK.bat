@echo off
setlocal

if not exist android\gradlew.bat (
  echo Android project not found. Run SETUP_ANDROID.bat first.
  exit /b 1
)

call npm run build
if errorlevel 1 exit /b 1
call npx cap sync android
if errorlevel 1 exit /b 1

cd android
call gradlew.bat assembleDebug
if errorlevel 1 exit /b 1

echo.
echo APK created at:
echo android\app\build\outputs\apk\debug\app-debug.apk
exit /b 0
