#!/bin/bash
set -e

# Database backup script
# Usage: ./scripts/backup-db.sh

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cannagri_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f .env ]; then
    source .env
fi

POSTGRES_USER=${POSTGRES_USER:-cannagri}
POSTGRES_DB=${POSTGRES_DB:-cannagri}

echo "Creating backup..."

docker compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

echo "Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Old backups cleaned up (kept last 7 days)"
