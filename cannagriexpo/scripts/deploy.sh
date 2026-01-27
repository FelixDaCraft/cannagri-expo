#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Cann'Agri Expo - Deployment Script   ${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Copy .env.example to .env and fill in your values${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: Please set DATABASE_URL in .env${NC}"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "GENERATE_WITH_openssl_rand_base64_32" ]; then
    echo -e "${YELLOW}Generating NEXTAUTH_SECRET...${NC}"
    NEW_SECRET=$(openssl rand -base64 32)
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEW_SECRET|" .env
    echo -e "${GREEN}NEXTAUTH_SECRET generated and saved to .env${NC}"
fi

echo -e "${YELLOW}Building and starting containers...${NC}"

# Build and start
docker compose build --no-cache
docker compose up -d

# Wait for app to be ready
echo -e "${YELLOW}Waiting for application to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker compose exec -T app npx prisma db push --accept-data-loss

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment completed successfully!   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  docker compose logs -f app     # View app logs"
echo "  docker compose ps              # View running containers"
echo "  docker compose down            # Stop all containers"
echo "  docker compose restart app     # Restart app"
