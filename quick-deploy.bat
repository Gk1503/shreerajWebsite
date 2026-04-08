@echo off
echo ========================================
echo Quick Deploy to GitHub (Auto-deploy to Vercel)
echo ========================================
echo.

REM Add all changes
echo Adding all changes...
git add .

REM Commit with timestamp
echo Committing changes...
set timestamp=%date% %time%
git commit -m "Update: %timestamp%"

REM Push to GitHub
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Vercel will auto-deploy shortly.
echo ========================================
pause
