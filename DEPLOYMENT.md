# Déploiement

Cann'Agri Expo tourne sur le **homelab** (exposé par le tunnel Cloudflare, `cannagri-expo.eu` → `127.0.0.1:3040`).

| Élément | Emplacement |
|---------|-------------|
| Compose, `.env` (secrets) | `/opt/cannagri-expo/` |
| Code source de l'image | `/opt/cannagri-expo/app/` (copie synchronisée, pas un clone git) |
| Base PostgreSQL | conteneur `cannagri-postgres`, données dans `/opt/cannagri-expo/pgdata` |
| Photos de la galerie | `/opt/cannagri-expo/images/gallery` (volume) |
| Sauvegardes | `/root/backups/cannagri-db-*.sql.gz` |

## Déploiement automatique

Un push sur la branche **`Prod`** lance `.github/workflows/deploy.yml` :

1. tests sur GitHub (`npm test`) ;
2. sur le runner auto-hébergé `homelab-cannagri`, `sudo /usr/local/bin/cannagri-deploy` (source : `scripts/homelab/cannagri-deploy.sh`) :
   - sauvegarde de la base (`cannagri-db-<date>-auto.sql.gz`, 15 conservées) ;
   - copie du code dans `/opt/cannagri-expo/app` (photos, fichiers envoyés et `.env` préservés) ;
   - build de l'image `cannagri-expo:local` (relance les tests) ;
   - **contrôle que la base correspond au schéma Prisma** : sinon le déploiement s'arrête sans toucher au site ;
   - bascule, puis contrôle de santé ; en cas d'échec, retour automatique à l'image précédente (`cannagri-expo:previous`).

Un push sur `dev` ou une pull request ne lance que les tests.

## Changement de schéma de base

Le projet n'utilise pas `prisma migrate` : les changements de schéma s'appliquent avec un script SQL dans `prisma/manual-migrations/`, **avant** de pousser le code qui en dépend :

```bash
ssh root@<homelab>
cd /opt/cannagri-expo
docker exec cannagri-postgres pg_dump -U cannagri -d cannagri | gzip > /root/backups/cannagri-db-$(date +%Y%m%d-%H%M)-avant-<sujet>.sql.gz
docker exec -i cannagri-postgres psql -v ON_ERROR_STOP=1 -U cannagri -d cannagri < <script>.sql
```

Pousser ensuite sur `Prod` : le contrôle de schéma du déploiement confirme que base et code concordent.

## Retour arrière manuel

```bash
cd /opt/cannagri-expo
docker tag cannagri-expo:previous cannagri-expo:local && docker compose up -d app
```

## Mise en place (déjà faite)

- Runner : `/home/github-runner/actions-runner-cannagri` (service `actions.runner.FelixDaCraft-cannagri-expo.homelab-cannagri`, drop-in mémoire `memoire.conf` comme les autres runners).
- Script : `/usr/local/bin/cannagri-deploy` (root, 755), autorisé par `/etc/sudoers.d/github-runner-cannagri`. Après modification de `scripts/homelab/cannagri-deploy.sh`, le recopier à la main sur le homelab.
