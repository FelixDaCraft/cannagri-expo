#!/bin/bash
#
# CANN'AGRI EXPO - Script de déploiement automatique
# Usage: curl -fsSL URL/deploy.sh | bash
#        ou: ./deploy.sh
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
APP_DIR="$HOME/cannagri-expo"

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Vérifier/Installer Docker
echo -e "${BLUE}[1/6] Vérification de Docker...${NC}"
if ! command_exists docker; then
    echo -e "${YELLOW}Docker non trouvé. Installation en cours...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker installé avec succès${NC}"
else
    echo -e "${GREEN}Docker est déjà installé${NC}"
fi

# 2. Vérifier Docker Compose
echo -e "${BLUE}[2/6] Vérification de Docker Compose...${NC}"
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${YELLOW}Installation de Docker Compose plugin...${NC}"
    sudo apt-get update -qq
    sudo apt-get install -y docker-compose-plugin
fi
echo -e "${GREEN}Docker Compose OK${NC}"

# 3. Télécharger le projet
echo -e "${BLUE}[3/6] Téléchargement du projet...${NC}"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Le dossier $APP_DIR existe déjà${NC}"
    read -p "Voulez-vous le supprimer et réinstaller ? (o/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        rm -rf "$APP_DIR"
    else
        echo -e "${YELLOW}Mise à jour du projet existant...${NC}"
        cd "$APP_DIR"
        if [ -d ".git" ]; then
            git pull origin "$BRANCH" 2>/dev/null || true
        fi
    fi
fi

if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"

    # Télécharger via curl (plus fiable que git clone)
    echo -e "${YELLOW}Téléchargement de l'archive...${NC}"
    ARCHIVE_URL="${REPO_URL}/archive/refs/heads/${BRANCH}.tar.gz"
    curl -L "$ARCHIVE_URL" -o repo.tar.gz 2>/dev/null || {
        # Fallback: essayer avec git
        echo -e "${YELLOW}Tentative avec git...${NC}"
        if command_exists git; then
            git clone -b "$BRANCH" "$REPO_URL" .
        else
            echo -e "${RED}Erreur: Impossible de télécharger le projet${NC}"
            exit 1
        fi
    }

    if [ -f "repo.tar.gz" ]; then
        tar -xzf repo.tar.gz --strip-components=1
        rm repo.tar.gz
    fi
fi

cd "$APP_DIR"
echo -e "${GREEN}Projet téléchargé dans $APP_DIR${NC}"

# 4. Configurer l'environnement
echo -e "${BLUE}[4/6] Configuration de l'environnement...${NC}"

if [ ! -f ".env" ]; then
    # Générer un secret aléatoire
    RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "DefaultSecret$(date +%s)")
    RANDOM_PASSWORD="CannAgri$(openssl rand -hex 8 2>/dev/null || echo $(date +%s))!"

    # Détecter l'IP publique
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

    cat > .env << EOF
# ===========================================
# CANN'AGRI EXPO - Configuration
# Généré automatiquement le $(date)
# ===========================================

# Database PostgreSQL
POSTGRES_USER=cannagri
POSTGRES_PASSWORD=${RANDOM_PASSWORD}
POSTGRES_DB=cannagri

# Application
APP_PORT=3000
NEXT_PUBLIC_APP_URL=http://${PUBLIC_IP}:3000
NEXTAUTH_URL=http://${PUBLIC_IP}:3000
NEXTAUTH_SECRET=${RANDOM_SECRET}

# Viva Wallet API (mode demo par défaut)
VIVA_WALLET_CLIENT_ID=
VIVA_WALLET_CLIENT_SECRET=
VIVA_WALLET_MERCHANT_ID=
VIVA_WALLET_API_KEY=
VIVA_WALLET_SOURCE_CODE=
VIVA_WALLET_DEMO_MODE=true

# Email SMTP (optionnel)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@cannagri-expo.fr
EOF
    echo -e "${GREEN}Fichier .env créé${NC}"
else
    echo -e "${YELLOW}Fichier .env existant conservé${NC}"
fi

# 5. Build et démarrage des containers
echo -e "${BLUE}[5/6] Construction et démarrage des containers...${NC}"

# Déterminer si sudo est nécessaire pour docker
DOCKER_CMD="docker"
if ! docker info >/dev/null 2>&1; then
    if sudo docker info >/dev/null 2>&1; then
        DOCKER_CMD="sudo docker"
        echo -e "${YELLOW}Utilisation de sudo pour Docker...${NC}"
    fi
fi

# Arrêter les containers existants si présents
$DOCKER_CMD compose down 2>/dev/null || true

# Build
echo -e "${YELLOW}Build en cours (peut prendre quelques minutes)...${NC}"
$DOCKER_CMD compose build --no-cache

# Démarrer
$DOCKER_CMD compose up -d

# Attendre que la DB soit prête
echo -e "${YELLOW}Attente de la base de données...${NC}"
sleep 15

# 6. Initialiser la base de données
echo -e "${BLUE}[6/6] Initialisation de la base de données...${NC}"

# Push du schéma Prisma
$DOCKER_CMD compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null || {
    echo -e "${YELLOW}Nouvelle tentative dans 10 secondes...${NC}"
    sleep 10
    $DOCKER_CMD compose exec -T app npx prisma db push --accept-data-loss
}

# Seeder la base (optionnel mais recommandé)
echo -e "${YELLOW}Création des données initiales...${NC}"
$DOCKER_CMD compose exec -T app npx prisma db seed 2>/dev/null || echo -e "${YELLOW}Seed ignoré (optionnel)${NC}"

# Récupérer les infos
source .env

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║        ✓ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !           ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}URL de l'application:${NC} ${NEXT_PUBLIC_APP_URL}"
echo -e "  ${GREEN}Admin:${NC} ${NEXT_PUBLIC_APP_URL}/admin"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Credentials Admin (créés par le seed):${NC}"
echo -e "  Email: admin@cannagri-expo.fr"
echo -e "  Password: CannAgri2026!"
echo ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo "  cd $APP_DIR"
echo "  docker compose logs -f        # Voir les logs"
echo "  docker compose restart app    # Redémarrer l'app"
echo "  docker compose down           # Arrêter tout"
echo ""
echo -e "${BLUE}Configuration: $APP_DIR/.env${NC}"
echo ""
