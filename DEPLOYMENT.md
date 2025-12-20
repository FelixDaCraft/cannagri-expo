# Deployment Guide - Cann'Agri Expo on Hetzner

## Architecture

```
Internet → Traefik (SSL) → Next.js App → Neon PostgreSQL (Cloud)
```

## Prerequisites

1. **Hetzner Cloud Server** (recommended: CX21 or higher)
   - Ubuntu 22.04+
   - 2 vCPUs, 4GB RAM minimum

2. **Domain** pointing to your Hetzner server IP
   - `cannagri-expo.eu` → Server IP
   - `www.cannagri-expo.eu` → Server IP

3. **Neon PostgreSQL** database (already configured)

4. **GitHub Repository** with Actions enabled

---

## Step 1: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `HETZNER_HOST` | Your Hetzner server IP address |
| `HETZNER_USER` | SSH username (usually `root`) |
| `HETZNER_SSH_KEY` | Private SSH key for server access |
| `NEXT_PUBLIC_APP_URL` | `https://cannagri-expo.eu` |
| `NEXT_PUBLIC_SITE_URL` | `https://cannagri-expo.eu` |
| `NEXT_PUBLIC_TICKETING_ENABLED` | `false` or `true` |
| `NEXT_PUBLIC_DEMO_MODE` | `false` |

---

## Step 2: Initial Server Setup

SSH into your Hetzner server:

```bash
ssh root@YOUR_SERVER_IP
```

Run the setup script:

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/FelixDaCraft/cannagri-expo/main/scripts/hetzner-setup.sh | bash
```

Or manually:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Create app directory
mkdir -p /opt/cannagri-expo
cd /opt/cannagri-expo
```

---

## Step 3: Configure Environment

Create the `.env` file on the server:

```bash
nano /opt/cannagri-expo/.env
```

Add your production environment variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:PASSWORD@HOST.neon.tech/neondb?sslmode=require"

# Application URLs
NEXTAUTH_URL="https://cannagri-expo.eu"
NEXT_PUBLIC_APP_URL="https://cannagri-expo.eu"
NEXT_PUBLIC_SITE_URL="https://cannagri-expo.eu"

# NextAuth Secret
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Viva Wallet
VIVA_WALLET_MERCHANT_ID="your-merchant-id"
VIVA_WALLET_API_KEY="your-api-key"
VIVA_WALLET_DEMO_MODE="false"
VIVA_WALLET_SOURCE_CODE="your-source-code"

# SMTP
SMTP_HOST="smtp.ionos.fr"
SMTP_PORT="465"
SMTP_USER="your@email.com"
SMTP_PASSWORD="your-password"
EMAIL_FROM="your@email.com"

# Features
NEXT_PUBLIC_TICKETING_ENABLED="false"
NEXT_PUBLIC_DEMO_MODE="false"

# Let's Encrypt email
ACME_EMAIL="admin@cannagri-expo.eu"
```

---

## Step 4: Copy Docker Compose

Copy the Hetzner docker-compose file:

```bash
# On your local machine
scp docker-compose.hetzner.yml root@YOUR_SERVER_IP:/opt/cannagri-expo/docker-compose.yml
```

Or create it directly on the server using the content from `docker-compose.hetzner.yml`.

---

## Step 5: Generate SSH Key for GitHub Actions

On your Hetzner server:

```bash
# Generate a new SSH key for deployments
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# Add to authorized keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Display private key (copy this to GitHub secret HETZNER_SSH_KEY)
cat ~/.ssh/github_deploy
```

---

## Step 6: First Deployment

Manually pull and start for the first time:

```bash
cd /opt/cannagri-expo

# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull image
docker pull ghcr.io/felixdacraft/cannagri-expo:latest

# Start services
docker compose up -d

# Check status
docker compose ps
docker compose logs -f app
```

---

## Step 7: Automatic Deployments

After initial setup, every push to `main` or `master` branch will:

1. Run tests
2. Build Docker image
3. Push to GitHub Container Registry
4. SSH to Hetzner and deploy

---

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Restart app
docker compose restart app

# Full restart
docker compose down && docker compose up -d

# Update manually
docker pull ghcr.io/felixdacraft/cannagri-expo:latest
docker compose up -d

# Check SSL certificates
docker compose exec traefik cat /letsencrypt/acme.json

# Database migration (if needed)
docker compose exec app npx prisma migrate deploy
```

---

## Troubleshooting

### SSL Certificate Issues
```bash
# Check Traefik logs
docker compose logs traefik

# Make sure ports 80 and 443 are open
ufw allow 80
ufw allow 443
```

### App Not Starting
```bash
# Check app logs
docker compose logs app

# Verify environment variables
docker compose exec app env | grep -E "(DATABASE|NEXT|AUTH)"
```

### Database Connection Issues
```bash
# Test database connection
docker compose exec app npx prisma db pull
```

---

## Security Recommendations

1. **Firewall**: Only allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
   ```bash
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

2. **SSH Hardening**: Disable password authentication
   ```bash
   # Edit /etc/ssh/sshd_config
   PasswordAuthentication no
   ```

3. **Regular Updates**
   ```bash
   apt update && apt upgrade -y
   ```

4. **Backup**: Set up automated database backups via Neon dashboard
