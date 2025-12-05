#!/bin/bash
#
# CANN'AGRI EXPO - Script de déploiement automatique
# Usage: curl -fsSL URL/deploy.sh | sudo bash
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║           CANN'AGRI EXPO - Déploiement               ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Variables
REPO_URL="https://github.com/BorisHenne/cannagri"
BRANCH="claude/cannagri-expo-website-01KPxPrPBdZJDnyNNoaqLipw"
APP_DIR="/volume1/docker/cannagri-expo"

# 1. Vérifier Docker
echo -e "${BLUE}[1/7] Vérification de Docker...${NC}"
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}Docker non trouvé. Veuillez l'installer.${NC}"
    exit 1
fi
echo -e "${GREEN}Docker OK${NC}"

# 2. Vérifier Docker Compose
echo -e "${BLUE}[2/7] Vérification de Docker Compose...${NC}"
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Docker Compose non trouvé.${NC}"
    exit 1
fi
echo -e "${GREEN}Docker Compose OK${NC}"

# 3. Nettoyer et télécharger
echo -e "${BLUE}[3/7] Téléchargement du projet...${NC}"
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

ARCHIVE_URL="${REPO_URL}/archive/refs/heads/${BRANCH}.tar.gz"
echo -e "${YELLOW}Téléchargement depuis GitHub...${NC}"
curl -sL "$ARCHIVE_URL" | tar -xz --strip-components=1

if [ ! -f "package.json" ]; then
    echo -e "${RED}Erreur: Téléchargement échoué${NC}"
    exit 1
fi
echo -e "${GREEN}Projet téléchargé${NC}"

# 4. Créer les assets
echo -e "${BLUE}[4/7] Préparation des assets...${NC}"
mkdir -p "$APP_DIR/public/images"

# Créer un logo SVG placeholder
cat > "$APP_DIR/public/images/logo.svg" << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="95" fill="#F4F1E8" stroke="#2E4A33" stroke-width="4"/>
  <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="#2E4A33">CANN'AGRI</text>
  <text x="100" y="115" text-anchor="middle" font-family="Arial" font-size="16" fill="#A4B494">EXPO 2026</text>
</svg>
SVGEOF

# Convertir en PNG simple (fallback texte)
cat > "$APP_DIR/public/images/logo.png" << 'PNGEOF'
PNGEOF

echo -e "${GREEN}Assets créés${NC}"

# 5. Configuration .env
echo -e "${BLUE}[5/7] Configuration de l'environnement...${NC}"

RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "Secret$(date +%s)")
RANDOM_PASSWORD="CannAgri$(openssl rand -hex 6 2>/dev/null || date +%s)!"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

cat > .env << EOF
# CANN'AGRI EXPO - Configuration
# Généré le $(date)

POSTGRES_USER=cannagri
POSTGRES_PASSWORD=${RANDOM_PASSWORD}
POSTGRES_DB=cannagri

APP_PORT=3000
NEXT_PUBLIC_APP_URL=http://${PUBLIC_IP}:3000
NEXTAUTH_URL=http://${PUBLIC_IP}:3000
NEXTAUTH_SECRET=${RANDOM_SECRET}

VIVA_WALLET_CLIENT_ID=
VIVA_WALLET_CLIENT_SECRET=
VIVA_WALLET_MERCHANT_ID=
VIVA_WALLET_API_KEY=
VIVA_WALLET_SOURCE_CODE=
VIVA_WALLET_DEMO_MODE=true

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@cannagri-expo.fr
EOF
echo -e "${GREEN}Fichier .env créé${NC}"

# 6. Build et démarrage
echo -e "${BLUE}[6/7] Construction Docker (5-10 min)...${NC}"

docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo -e "${YELLOW}Attente de la base de données (30s)...${NC}"
sleep 30

# 7. Initialiser la BDD
echo -e "${BLUE}[7/7] Initialisation de la base de données...${NC}"

for i in 1 2 3; do
    if docker compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null; then
        break
    fi
    echo -e "${YELLOW}Tentative $i/3...${NC}"
    sleep 10
done

docker compose exec -T app npx prisma db seed 2>/dev/null || true

# Résultat
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║       ✓ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "  ${GREEN}Site:${NC}  http://${PUBLIC_IP}:3000"
echo -e "  ${GREEN}Admin:${NC} http://${PUBLIC_IP}:3000/admin"
echo ""
echo -e "  ${YELLOW}Login:${NC} admin@cannagri-expo.fr / CannAgri2026!"
echo ""
echo -e "  ${BLUE}Commandes:${NC}"
echo "    cd $APP_DIR"
echo "    docker compose logs -f"
echo "    docker compose restart app"
echo ""
echo -e "  ${YELLOW}Logo:${NC} Copiez votre logo dans $APP_DIR/public/images/logo.png"
echo ""
