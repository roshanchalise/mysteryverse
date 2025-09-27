#!/bin/bash

# Manual GitHub Pages Deployment Script
# Run this if GitHub Actions deployment fails

echo "🚀 Manual GitHub Pages Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Building frontend...${NC}"
cd frontend

# Set production environment
export NODE_ENV=production
export VITE_API_URL=https://mysteryverse-backend-production.up.railway.app

npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

cd ..

echo -e "${BLUE}Step 2: Deploying to gh-pages branch...${NC}"

# Create a temporary directory for deployment
rm -rf temp-deploy
mkdir temp-deploy
cp -r frontend/dist/* temp-deploy/

# Navigate to temporary directory
cd temp-deploy

# Initialize git and create gh-pages branch
git init
git config user.name "GitHub Pages Deploy"
git config user.email "deploy@github.com"

# Add all files and commit
git add .
git commit -m "Deploy to GitHub Pages"

# Force push to gh-pages branch
git remote add origin https://github.com/roshanchalise/mysteryverse.git
git branch -M gh-pages

echo -e "${YELLOW}You will need to authenticate with GitHub to push...${NC}"
git push -f origin gh-pages

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully deployed to GitHub Pages${NC}"
    echo -e "${GREEN}Your site will be available at: https://roshanchalise.github.io/mysteryverse/${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo -e "${YELLOW}You may need to manually enable GitHub Pages in repository settings${NC}"
fi

# Clean up
cd ..
rm -rf temp-deploy

echo -e "${GREEN}Done! Check your repository's Pages settings if deployment didn't work.${NC}"