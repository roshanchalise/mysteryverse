#!/bin/bash

# Mystery Verse Deployment Script
# This script helps automate the deployment process

echo "🚀 Mystery Verse Deployment Helper"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Preparing for deployment...${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not in a git repository. Please run 'git init' first.${NC}"
    exit 1
fi

# Check if changes are committed
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes. Committing them now...${NC}"
    git add -A
    git commit -m "Prepare for deployment"
fi

echo -e "${GREEN}✓ Git repository ready${NC}"

echo -e "${BLUE}Step 2: Building frontend...${NC}"
cd frontend
npm install
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..

echo -e "${BLUE}Step 3: Setting up backend...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Backend setup failed${NC}"
    exit 1
fi
cd ..

echo -e "${GREEN}✓ All builds successful!${NC}"
echo ""
echo -e "${YELLOW}Next steps (manual):${NC}"
echo "1. Push your code to GitHub if not already done:"
echo "   git push origin main"
echo ""
echo "2. Deploy Backend to Railway:"
echo "   - Visit https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Deploy the backend folder"
echo "   - Add PostgreSQL database"
echo "   - Set environment variables (see DEPLOYMENT_INSTRUCTIONS.md)"
echo ""
echo "3. Deploy Frontend to Vercel:"
echo "   - Visit https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Set build settings as described in DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo -e "${GREEN}📋 See DEPLOYMENT_INSTRUCTIONS.md for detailed steps${NC}"