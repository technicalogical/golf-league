#!/bin/bash

# Production Deployment Script for Golf League Application
# Usage: ./deploy-production.sh

set -e  # Exit on any error

echo "🚀 Starting production deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Stash any local changes
echo -e "${BLUE}📦 Stashing local changes...${NC}"
git stash

# Step 2: Pull latest changes from GitHub
echo -e "${BLUE}⬇️  Pulling latest changes from GitHub...${NC}"
git pull origin main

# Step 3: Install dependencies
echo -e "${BLUE}📥 Installing dependencies...${NC}"
npm install

# Step 4: Run database migrations (if any)
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
# Uncomment the migrations you need to run:
# npm run migrate:players
# npm run migrate:league-members

# Step 5: Build the application
echo -e "${BLUE}🔨 Building production application...${NC}"
npm run build

# Step 6: Restart the service
echo -e "${BLUE}🔄 Restarting golf-league service...${NC}"
sudo systemctl restart golf-league

# Step 7: Wait a moment for service to start
echo -e "${BLUE}⏳ Waiting for service to start...${NC}"
sleep 3

# Step 8: Check service status
echo -e "${BLUE}✅ Checking service status...${NC}"
sudo systemctl status golf-league --no-pager -l

# Step 9: Show recent logs
echo ""
echo -e "${BLUE}📋 Recent logs:${NC}"
sudo journalctl -u golf-league -n 20 --no-pager

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Service Info:${NC}"
echo "  URL: https://golf.spaceclouds.xyz"
echo "  Status: sudo systemctl status golf-league"
echo "  Logs: sudo journalctl -u golf-league -f"
echo ""
