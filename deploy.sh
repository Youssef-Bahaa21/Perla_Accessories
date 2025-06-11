#!/bin/bash

echo "🚀 Perla Accessories Deployment Helper"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is initialized
if [ ! -d .git ]; then
    print_error "Git repository not initialized!"
    echo "Run: git init"
    exit 1
fi

print_status "Checking project structure..."

# Check if required files exist
if [ ! -f "client/package.json" ]; then
    print_error "client/package.json not found!"
    exit 1
fi

if [ ! -f "server/package.json" ]; then
    print_error "server/package.json not found!"
    exit 1
fi

print_status "Project structure looks good!"

# Check if .env.example exists
if [ ! -f "server/env.example" ]; then
    print_warning "server/env.example not found. Creating it..."
    # The file should already be created by our previous script
fi

print_status "Building server..."
cd server
npm run build
if [ $? -ne 0 ]; then
    print_error "Server build failed!"
    exit 1
fi
cd ..

print_status "Building client..."
cd client
npm run build
if [ $? -ne 0 ]; then
    print_error "Client build failed!"
    exit 1
fi
cd ..

print_status "All builds successful!"

echo ""
echo "🎯 Next Steps for Deployment:"
echo "=============================="
echo ""
echo "1. 📦 Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. 🎨 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Set build command: cd client && npm ci && npm run build"
echo "   - Set output directory: client/dist/client/browser"
echo ""
echo "3. 🚂 Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Add MySQL database service"
echo "   - Set environment variables (see DEPLOYMENT_CHECKLIST.md)"
echo ""
echo "4. 🔧 Update URLs:"
echo "   - Update client/src/environments/environment.prod.ts with your Railway URL"
echo "   - Commit and push changes"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_CHECKLIST.md"

print_status "Deployment preparation complete!" 