#!/usr/bin/env bash
# Déploiement de Cann'Agri Expo sur le homelab.
#
# Installé dans /usr/local/bin/cannagri-deploy (root) et lancé par le runner
# GitHub Actions via sudo (voir .github/workflows/deploy.yml) :
#   sudo /usr/local/bin/cannagri-deploy "$GITHUB_WORKSPACE"
#
# Étapes : sauvegarde de la base -> copie du code dans /opt/cannagri-expo/app
# -> build de l'image (lance les tests) -> contrôle que la base correspond au
# schéma Prisma -> bascule -> contrôle de santé. En cas d'échec après le build,
# l'image précédente est remise en service.
set -euo pipefail

APP_DIR=/opt/cannagri-expo
WORK_ROOT=/home/github-runner/actions-runner-cannagri/_work
BACKUP_DIR=/root/backups
IMAGE=cannagri-expo:local
PREVIOUS=cannagri-expo:previous
HEALTH_URL=http://127.0.0.1:3040/api/health
KEEP_BACKUPS=15

fail() { echo "::error::$*" >&2; exit 1; }

# Le script tourne en root : la source doit être le dossier de travail du runner
SRC=$(realpath -e -- "${1:-}" 2>/dev/null) || fail "Dossier source introuvable"
[[ "$SRC" == "$WORK_ROOT"/* ]] || fail "Source hors du dossier de travail du runner : $SRC"
[[ -f "$SRC/package.json" && -f "$SRC/Dockerfile" && -f "$SRC/prisma/schema.prisma" ]] \
  || fail "La source ne ressemble pas au dépôt cannagri-expo"

cd "$APP_DIR"
TS=$(date +%Y%m%d-%H%M%S)

echo "== Sauvegarde de la base"
mkdir -p "$BACKUP_DIR"
docker exec cannagri-postgres pg_dump -U cannagri -d cannagri | gzip > "$BACKUP_DIR/cannagri-db-$TS-auto.sql.gz"
gunzip -t "$BACKUP_DIR/cannagri-db-$TS-auto.sql.gz"
echo "   $BACKUP_DIR/cannagri-db-$TS-auto.sql.gz"

echo "== Copie du code"
# Les photos, les fichiers envoyés et les secrets propres au serveur sont préservés
rsync -rlc --delete \
  --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=public/images/gallery --exclude=public/uploads --exclude='.env*' \
  "$SRC/" "$APP_DIR/app/"

echo "== Build de l'image (tests inclus)"
if docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker tag "$IMAGE" "$PREVIOUS"
fi
docker compose build app

rollback() {
  echo "::error::$*" >&2
  if docker image inspect "$PREVIOUS" >/dev/null 2>&1; then
    echo "== Retour à l'image précédente"
    docker tag "$PREVIOUS" "$IMAGE"
    docker compose up -d app
  fi
  exit 1
}

echo "== Contrôle du schéma de la base"
# Le schéma est appliqué à la main (prisma/manual-migrations) : on refuse de
# basculer sur un code qui attend une base non migrée.
set +e
docker compose run --rm --no-deps -T app \
  npx prisma migrate diff --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma --exit-code
DIFF=$?
set -e
case $DIFF in
  0) echo "   Base conforme au schéma" ;;
  2) docker tag "$PREVIOUS" "$IMAGE"
     fail "La base ne correspond pas au schéma : appliquer la migration SQL (prisma/manual-migrations) puis relancer le déploiement. Le site n'a pas été modifié." ;;
  *) docker tag "$PREVIOUS" "$IMAGE"
     fail "Contrôle du schéma impossible (code $DIFF). Le site n'a pas été modifié." ;;
esac

echo "== Bascule"
docker compose up -d app

for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "$HEALTH_URL"; then
    echo "== Déployé : $(docker inspect --format '{{.Image}}' cannagri-app | cut -c8-19)"
    ls -1t "$BACKUP_DIR"/cannagri-db-*-auto.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm --
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done
docker logs --tail 50 cannagri-app >&2 || true
rollback "L'application ne répond pas après la bascule"
