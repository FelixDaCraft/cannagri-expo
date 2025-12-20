#!/bin/bash
# =============================================================================
# Hetzner Server Initial Setup Script for Cann'Agri Expo
# Run this script once on a fresh Hetzner server
# =============================================================================

set -e

echo "=== Cann'Agri Expo - Hetzner Server Setup ==="

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "Installing Docker Compose..."
apt install -y docker-compose-plugin

# Create app directory
echo "Creating application directory..."
mkdir -p /opt/cannagri-expo
cd /opt/cannagri-expo

# Create uploads directory with correct permissions
mkdir -p ./public/uploads
chmod 755 ./public/uploads

# Create .env file template
echo "Creating .env template..."
cat > .env << 'EOF'
# =============================================================================
# PRODUCTION ENVIRONMENT - Hetzner Server
# =============================================================================

# Database (using Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require"

# Application URLs
NEXTAUTH_URL="https://cannagri-expo.eu"
NEXT_PUBLIC_APP_URL="https://cannagri-expo.eu"
NEXT_PUBLIC_SITE_URL="https://cannagri-expo.eu"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="YOUR_SECRET_HERE"

# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# Viva Wallet - PRODUCTION
VIVA_WALLET_MERCHANT_ID="YOUR_MERCHANT_ID"
VIVA_WALLET_API_KEY="YOUR_API_KEY"
VIVA_WALLET_DEMO_MODE="false"
VIVA_WALLET_SOURCE_CODE="YOUR_SOURCE_CODE"

# Email SMTP
SMTP_HOST="smtp.ionos.fr"
SMTP_PORT="465"
SMTP_USER="your@email.com"
SMTP_PASSWORD="your_password"
EMAIL_FROM="your@email.com"

# Event info
NEXT_PUBLIC_EVENT_DATE="2026-03-28"
NEXT_PUBLIC_EVENT_LOCATION="L'Agronaute, Nantes"

# Features
NEXT_PUBLIC_DEMO_MODE="false"
NEXT_PUBLIC_TICKETING_ENABLED="false"

# Port
PORT=3000
EOF

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit /opt/cannagri-expo/.env with your actual credentials"
echo "2. Copy docker-compose.hetzner.yml to /opt/cannagri-expo/docker-compose.yml"
echo "3. Configure your domain DNS to point to this server"
echo "4. Run: docker compose up -d"
echo ""
