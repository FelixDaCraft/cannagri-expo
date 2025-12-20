#!/bin/bash
#
# CANN'AGRI EXPO - Script de déploiement automatique
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
BRANCH="dev"
APP_DIR="/opt/cannagri-expo"

# 1. Vérifier Docker
echo -e "${BLUE}[1/6] Vérification de Docker...${NC}"
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}Docker non trouvé. Veuillez l'installer.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker OK${NC}"

# 2. Vérifier Docker Compose
echo -e "${BLUE}[2/6] Vérification de Docker Compose...${NC}"
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Docker Compose non trouvé.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose OK${NC}"

# 3. Nettoyer et télécharger
echo -e "${BLUE}[3/6] Téléchargement du projet...${NC}"

# Arrêter les containers existants avant nettoyage
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR" 2>/dev/null && docker compose down 2>/dev/null || true
fi

# Sauvegarder les images existantes si présentes
if [ -d "$APP_DIR/public/images" ]; then
    echo -e "${YELLOW}Sauvegarde des images existantes...${NC}"
    mkdir -p /tmp/cannagri-images-backup
    cp -r "$APP_DIR/public/images/"* /tmp/cannagri-images-backup/ 2>/dev/null || true
fi

# Sauvegarder le .env si présent
if [ -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}Sauvegarde du .env existant...${NC}"
    cp "$APP_DIR/.env" /tmp/cannagri-env-backup
fi

# Supprimer l'ancien répertoire
rm -rf "$APP_DIR" 2>/dev/null || sudo rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

ARCHIVE_URL="${REPO_URL}/archive/refs/heads/${BRANCH}.tar.gz"
echo -e "${YELLOW}Téléchargement depuis GitHub...${NC}"
curl -sL "$ARCHIVE_URL" | tar -xz --strip-components=1

if [ ! -f "package.json" ]; then
    echo -e "${RED}Erreur: Téléchargement échoué${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Projet téléchargé${NC}"

# 4. Restaurer les fichiers sauvegardés
echo -e "${BLUE}[4/6] Restauration des fichiers...${NC}"
mkdir -p "$APP_DIR/public/images/gallery"

if [ -d "/tmp/cannagri-images-backup" ]; then
    echo -e "${YELLOW}Restauration des images sauvegardées...${NC}"
    cp -r /tmp/cannagri-images-backup/* "$APP_DIR/public/images/" 2>/dev/null || true
    rm -rf /tmp/cannagri-images-backup
fi

if [ -f "/tmp/cannagri-env-backup" ]; then
    echo -e "${YELLOW}Restauration du .env sauvegardé...${NC}"
    cp /tmp/cannagri-env-backup "$APP_DIR/.env"
    rm -f /tmp/cannagri-env-backup
fi

# 5. Vérifier le .env
echo -e "${BLUE}[5/6] Vérification de la configuration...${NC}"

if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${RED}Erreur: Fichier .env manquant!${NC}"
    echo -e "${YELLOW}Créez un fichier .env avec les variables suivantes:${NC}"
    echo ""
    echo "DATABASE_URL=postgresql://..."
    echo "NEXTAUTH_URL=https://..."
    echo "NEXTAUTH_SECRET=..."
    echo ""
    exit 1
fi

# Vérifier DATABASE_URL
source .env
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Erreur: DATABASE_URL non défini dans .env${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Configuration OK${NC}"

# 6. Build et démarrage
echo -e "${BLUE}[6/6] Construction Docker (5-10 min)...${NC}"

docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo -e "${YELLOW}Attente du démarrage de l'application (30s)...${NC}"
sleep 30

# Appliquer le schéma Prisma
echo -e "${YELLOW}Application du schéma de base de données...${NC}"
for i in 1 2 3; do
    if docker compose exec -T app npx prisma db push --accept-data-loss; then
        echo -e "${GREEN}✓ Schéma de base de données appliqué${NC}"
        break
    fi
    echo -e "${YELLOW}Tentative $i/3 - Attente 15s...${NC}"
    sleep 15
done

# Résultat
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

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
echo -e "  ${BLUE}Commandes utiles:${NC}"
echo "    cd $APP_DIR"
echo "    docker compose logs -f app"
echo "    docker compose restart app"
echo ""
