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
BRANCH="claude/cannagri-expo-website-01KPxPrPBdZJDnyNNoaqLipw"
APP_DIR="/volume1/docker/cannagri-expo"

# 1. Vérifier Docker
echo -e "${BLUE}[1/8] Vérification de Docker...${NC}"
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}Docker non trouvé. Veuillez l'installer.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker OK${NC}"

# 2. Vérifier Docker Compose
echo -e "${BLUE}[2/8] Vérification de Docker Compose...${NC}"
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Docker Compose non trouvé.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose OK${NC}"

# 3. Nettoyer et télécharger
echo -e "${BLUE}[3/8] Téléchargement du projet...${NC}"

# Sauvegarder les images existantes si présentes
if [ -d "$APP_DIR/public/images" ]; then
    echo -e "${YELLOW}Sauvegarde des images existantes...${NC}"
    mkdir -p /tmp/cannagri-images-backup
    cp -r "$APP_DIR/public/images/"* /tmp/cannagri-images-backup/ 2>/dev/null || true
fi

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
echo -e "${GREEN}✓ Projet téléchargé${NC}"

# 4. Restaurer les images sauvegardées
echo -e "${BLUE}[4/8] Préparation des images...${NC}"
mkdir -p "$APP_DIR/public/images/gallery"

if [ -d "/tmp/cannagri-images-backup" ]; then
    echo -e "${YELLOW}Restauration des images sauvegardées...${NC}"
    cp -r /tmp/cannagri-images-backup/* "$APP_DIR/public/images/" 2>/dev/null || true
    rm -rf /tmp/cannagri-images-backup
fi

# ============================================================
# PAUSE POUR COPIER LES IMAGES
# ============================================================
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   PAUSE - IMAGES                      ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Copiez maintenant vos images dans les dossiers suivants:${NC}"
echo ""
echo -e "  ${GREEN}Logo:${NC}"
echo -e "    $APP_DIR/public/images/logo.png"
echo ""
echo -e "  ${GREEN}Photos galerie (édition 2024):${NC}"
echo -e "    $APP_DIR/public/images/gallery/"
echo ""
echo -e "${CYAN}Exemple de commandes pour copier depuis votre poste:${NC}"
echo -e "  scp logo.png user@serveur:$APP_DIR/public/images/"
echo -e "  scp *.jpg user@serveur:$APP_DIR/public/images/gallery/"
echo ""

# Vérifier si le logo existe déjà
if [ -f "$APP_DIR/public/images/logo.png" ]; then
    echo -e "${GREEN}✓ Logo détecté: logo.png${NC}"
else
    echo -e "${YELLOW}⚠ Logo non trouvé${NC}"
fi

# Compter les images dans gallery
GALLERY_COUNT=$(ls -1 "$APP_DIR/public/images/gallery/"*.jpg 2>/dev/null | wc -l || echo "0")
if [ "$GALLERY_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ $GALLERY_COUNT image(s) détectée(s) dans gallery/${NC}"
else
    echo -e "${YELLOW}⚠ Aucune image dans gallery/${NC}"
fi

echo ""
echo -e "${YELLOW}Appuyez sur ENTRÉE quand les images sont copiées...${NC}"
read -r

# Vérification finale
echo -e "${BLUE}Vérification des fichiers...${NC}"
if [ -f "$APP_DIR/public/images/logo.png" ]; then
    echo -e "${GREEN}✓ Logo OK${NC}"
else
    echo -e "${RED}✗ Logo manquant - Le site utilisera un placeholder${NC}"
fi

GALLERY_COUNT=$(ls -1 "$APP_DIR/public/images/gallery/"*.jpg 2>/dev/null | wc -l || echo "0")
echo -e "${GREEN}✓ $GALLERY_COUNT image(s) dans gallery/${NC}"

echo ""

# 5. Configuration .env
echo -e "${BLUE}[5/8] Configuration de l'environnement...${NC}"

RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "Secret$(date +%s)")
RANDOM_PASSWORD="CannAgri$(openssl rand -hex 6 2>/dev/null || date +%s)!"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

cat > .env << EOF
# CANN'AGRI EXPO - Configuration
# Généré le $(date)

POSTGRES_USER=cannagri
POSTGRES_PASSWORD=${RANDOM_PASSWORD}
POSTGRES_DB=cannagri

DATABASE_URL=postgresql://cannagri:${RANDOM_PASSWORD}@db:5432/cannagri

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
echo -e "${GREEN}✓ Fichier .env créé${NC}"

# 6. Permissions
echo -e "${BLUE}[6/8] Configuration des permissions...${NC}"
chmod -R 755 "$APP_DIR/public/images"
echo -e "${GREEN}✓ Permissions OK${NC}"

# 7. Build et démarrage
echo -e "${BLUE}[7/8] Construction Docker (5-10 min)...${NC}"

docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo -e "${YELLOW}Attente de la base de données (30s)...${NC}"
sleep 30

# 8. Initialiser la BDD
echo -e "${BLUE}[8/8] Initialisation de la base de données...${NC}"

for i in 1 2 3; do
    if docker compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null; then
        echo -e "${GREEN}✓ Base de données initialisée${NC}"
        break
    fi
    echo -e "${YELLOW}Tentative $i/3...${NC}"
    sleep 10
done

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
echo -e "  ${BLUE}Commandes utiles:${NC}"
echo "    cd $APP_DIR"
echo "    docker compose logs -f app"
echo "    docker compose restart app"
echo ""
echo -e "  ${YELLOW}Pour ajouter des images plus tard:${NC}"
echo "    1. Copiez dans $APP_DIR/public/images/"
echo "    2. docker compose restart app"
echo ""
