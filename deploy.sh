#!/bin/bash

# Golf League Production Deployment Script
# Run as: ./deploy.sh

set -e  # Exit on error

echo "🏌️ Golf League Production Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please do not run as root. This script will use sudo when needed.${NC}"
    exit 1
fi

# Variables
PROD_DIR="/var/www/golf-league"
DEV_DIR="/home/brandon/golf-league"

echo "Step 1: Create production directory"
echo "------------------------------------"
if [ ! -d "$PROD_DIR" ]; then
    sudo mkdir -p "$PROD_DIR"
    sudo chown brandon:brandon "$PROD_DIR"
    echo -e "${GREEN}✓ Created $PROD_DIR${NC}"
else
    echo -e "${YELLOW}! Directory $PROD_DIR already exists${NC}"
fi
echo ""

echo "Step 2: Copy files to production"
echo "---------------------------------"
read -p "This will overwrite files in $PROD_DIR. Continue? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rsync -av --exclude 'node_modules' --exclude '.next' --exclude '.env*' \
        "$DEV_DIR/" "$PROD_DIR/"
    echo -e "${GREEN}✓ Files copied${NC}"
else
    echo -e "${YELLOW}! Skipped file copy${NC}"
fi
echo ""

echo "Step 3: Check for .env.local"
echo "----------------------------"
if [ ! -f "$PROD_DIR/.env.local" ]; then
    echo -e "${RED}✗ Missing $PROD_DIR/.env.local${NC}"
    echo ""
    echo "You need to create .env.local with:"
    echo "  - AUTH0_SECRET (generate with: openssl rand -hex 32)"
    echo "  - AUTH0_BASE_URL=https://golf.spaceclouds.xyz"
    echo "  - AUTH0_ISSUER_BASE_URL"
    echo "  - AUTH0_CLIENT_ID"
    echo "  - AUTH0_CLIENT_SECRET"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    read -p "Create .env.local now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano "$PROD_DIR/.env.local"
    else
        echo -e "${YELLOW}! You must create .env.local before continuing${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
fi
echo ""

echo "Step 4: Install dependencies"
echo "----------------------------"
cd "$PROD_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}! node_modules exists, run 'npm install' manually if needed${NC}"
fi
echo ""

echo "Step 5: Build application"
echo "------------------------"
read -p "Build the application? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run build
    echo -e "${GREEN}✓ Build complete${NC}"
else
    echo -e "${YELLOW}! Skipped build${NC}"
fi
echo ""

echo "Step 6: Install systemd service"
echo "-------------------------------"
if [ -f "/etc/systemd/system/golf-league.service" ]; then
    echo -e "${YELLOW}! Service already exists${NC}"
    read -p "Reinstall? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}! Skipped service installation${NC}"
        SKIP_SERVICE=true
    fi
fi

if [ "$SKIP_SERVICE" != "true" ]; then
    sudo cp "$DEV_DIR/golf-league.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    echo -e "${GREEN}✓ Service installed${NC}"
fi
echo ""

echo "Step 7: Install nginx configuration"
echo "-----------------------------------"
if [ -f "/etc/nginx/sites-available/golf.spaceclouds.xyz" ]; then
    echo -e "${YELLOW}! Nginx config already exists${NC}"
else
    read -p "Install nginx config? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo cp "$DEV_DIR/nginx-golf.conf" /etc/nginx/sites-available/golf.spaceclouds.xyz
        sudo ln -sf /etc/nginx/sites-available/golf.spaceclouds.xyz /etc/nginx/sites-enabled/
        sudo nginx -t && echo -e "${GREEN}✓ Nginx config installed${NC}"
    fi
fi
echo ""

echo "Step 8: Start service"
echo "--------------------"
read -p "Enable and start golf-league service? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo systemctl enable golf-league
    sudo systemctl restart golf-league
    sleep 2
    sudo systemctl status golf-league --no-pager
    echo ""
    echo -e "${GREEN}✓ Service started${NC}"
fi
echo ""

echo "Step 9: Reload nginx"
echo "-------------------"
read -p "Reload nginx? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Your app should be running at:"
echo "  https://golf.spaceclouds.xyz"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status golf-league    # Check status"
echo "  sudo journalctl -u golf-league -f    # View logs"
echo "  sudo systemctl restart golf-league   # Restart app"
echo ""
echo "Next steps:"
echo "  1. Configure Auth0 with production URLs"
echo "  2. Run Supabase migrations"
echo "  3. Test the application"
echo ""
