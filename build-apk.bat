@echo off
title Daily Routine APK Builder
echo ========================================================
echo       Daily Routine - Android APK Builder
echo ========================================================
echo.

:: 1. Sync latest web assets to Android
echo [1/3] Syncing latest web assets to Capacitor Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed. Please run 'npm install' first.
    pause
    exit /b 1
)
echo [OK] Web assets synced to android/app/src/main/assets/public
echo.

:: 2. Check Java Version
echo [2/3] Checking Java environment for Gradle build...
javac -version 2>&1 | findstr "1.8" >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [NOTICE] Your current system JAVA_HOME is Java 8.
    echo Modern Android builds (Gradle 8.x) require JDK 17+.
    echo.
    echo You have 2 easy options to get the APK:
    echo ----------------------------------------------------
    echo OPTION A (Recommended - Instant in Android Studio):
    echo   Run: npm run cap:open
    echo   Android Studio has its own built-in JDK 17+ and SDK.
    echo   In Android Studio, click: Build > Build Bundle(s) / APK(s) > Build APK(s)
    echo.
    echo OPTION B (Command Line Build):
    echo   1. Install JDK 17: winget install Microsoft.OpenJDK.17
    echo   2. Set JAVA_HOME to JDK 17
    echo   3. Run: cd android ^& gradlew.bat assembleDebug
    echo ----------------------------------------------------
    echo.
    set /p OPEN_STUDIO="Would you like to open Android Studio now? (Y/N): "
    if /i "%OPEN_STUDIO%"=="Y" (
        call npx cap open android
    )
    exit /b 0
)

:: 3. Run Gradle Build if modern JDK is detected
echo [3/3] Compiling Android APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] APK compiled successfully!
    echo Output location:
    echo android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================================
) else (
    echo.
    echo [ERROR] Gradle build failed. Opening Android Studio instead...
    cd ..
    call npx cap open android
)

pause
