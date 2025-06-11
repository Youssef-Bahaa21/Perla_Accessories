@echo off
echo.
echo 🚀 Perla Accessories Deployment Helper
echo =======================================
echo.

:: Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not initialized!
    echo Run: git init
    pause
    exit /b 1
)

echo ✅ Checking project structure...

:: Check if required files exist
if not exist "client\package.json" (
    echo ❌ client\package.json not found!
    pause
    exit /b 1
)

if not exist "server\package.json" (
    echo ❌ server\package.json not found!
    pause
    exit /b 1
)

echo ✅ Project structure looks good!

echo ✅ Building server...
cd server
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Server build failed!
    pause
    exit /b 1
)
cd ..

echo ✅ Building client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Client build failed!
    pause
    exit /b 1
)
cd ..

echo ✅ All builds successful!
echo.
echo 🎯 Next Steps for Deployment:
echo ==============================
echo.
echo 1. 📦 Push to GitHub:
echo    git add .
echo    git commit -m "Ready for deployment"
echo    git push origin main
echo.
echo 2. 🎨 Deploy Frontend to Vercel:
echo    - Go to https://vercel.com
echo    - Connect your GitHub repository
echo    - Set build command: cd client ^&^& npm ci ^&^& npm run build
echo    - Set output directory: client/dist/client/browser
echo.
echo 3. 🚂 Deploy Backend to Railway:
echo    - Go to https://railway.app
echo    - Connect your GitHub repository
echo    - Add MySQL database service
echo    - Set environment variables (see DEPLOYMENT_CHECKLIST.md)
echo.
echo 4. 🔧 Update URLs:
echo    - Update client/src/environments/environment.prod.ts with your Railway URL
echo    - Commit and push changes
echo.
echo 📚 For detailed instructions, see DEPLOYMENT_CHECKLIST.md
echo.
echo ✅ Deployment preparation complete!
echo.
pause 