# =============================================================================
# Script de nettoyage PostgreSQL et Docker
# Exécuter en tant qu'Administrateur
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Nettoyage PostgreSQL et Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------------------------------------
# 1. Arrêt des services PostgreSQL
# -----------------------------------------------------------------------------
Write-Host "[1/5] Arrêt des services PostgreSQL..." -ForegroundColor Yellow

$postgresServices = @("postgresql-x64-16", "postgresql-x64-17", "postgresql-x64-18")

foreach ($service in $postgresServices) {
    $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
    if ($svc) {
        Write-Host "  - Arrêt de $service..." -NoNewline
        Stop-Service -Name $service -Force -ErrorAction SilentlyContinue
        Set-Service -Name $service -StartupType Disabled -ErrorAction SilentlyContinue
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host "  - $service non trouvé" -ForegroundColor Gray
    }
}

# -----------------------------------------------------------------------------
# 2. Désinstallation de PostgreSQL
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/5] Désinstallation de PostgreSQL..." -ForegroundColor Yellow

$uninstallers = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue

if ($uninstallers) {
    foreach ($version in $uninstallers) {
        $uninstallExe = Join-Path $version.FullName "uninstall-postgresql.exe"
        if (Test-Path $uninstallExe) {
            Write-Host "  - Désinstallation PostgreSQL $($version.Name)..." -ForegroundColor White
            Write-Host "    (Une fenêtre de désinstallation va s'ouvrir)" -ForegroundColor Gray
            Start-Process -FilePath $uninstallExe -ArgumentList "--mode unattended" -Wait -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "  - Aucune installation PostgreSQL trouvée dans Program Files" -ForegroundColor Gray
}

# -----------------------------------------------------------------------------
# 3. Suppression des données PostgreSQL
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/5] Suppression des données PostgreSQL..." -ForegroundColor Yellow

$postgresDataPaths = @(
    "C:\Program Files\PostgreSQL",
    "$env:APPDATA\postgresql",
    "$env:LOCALAPPDATA\PostgreSQL",
    "$env:USERPROFILE\PostgreSQL"
)

foreach ($path in $postgresDataPaths) {
    if (Test-Path $path) {
        Write-Host "  - Suppression de $path..." -NoNewline
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host " OK" -ForegroundColor Green
        } catch {
            Write-Host " ERREUR (peut nécessiter un redémarrage)" -ForegroundColor Red
        }
    }
}

# -----------------------------------------------------------------------------
# 4. Nettoyage Docker
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/5] Nettoyage Docker..." -ForegroundColor Yellow

$dockerRunning = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerRunning -or (Get-Command docker -ErrorAction SilentlyContinue)) {
    try {
        Write-Host "  - Suppression des conteneurs arrêtés..." -NoNewline
        docker container prune -f 2>$null
        Write-Host " OK" -ForegroundColor Green

        Write-Host "  - Suppression des images non utilisées..." -NoNewline
        docker image prune -a -f 2>$null
        Write-Host " OK" -ForegroundColor Green

        Write-Host "  - Suppression des volumes non utilisés..." -NoNewline
        docker volume prune -f 2>$null
        Write-Host " OK" -ForegroundColor Green

        Write-Host "  - Nettoyage complet du système Docker..." -NoNewline
        docker system prune -a --volumes -f 2>$null
        Write-Host " OK" -ForegroundColor Green
    } catch {
        Write-Host "  - Docker non accessible ou non démarré" -ForegroundColor Gray
    }
} else {
    Write-Host "  - Docker Desktop non démarré, nettoyage ignoré" -ForegroundColor Gray
}

# -----------------------------------------------------------------------------
# 5. Vérification finale
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/5] Vérification finale..." -ForegroundColor Yellow

# Vérifier les processus postgres restants
$postgresProcesses = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if ($postgresProcesses) {
    Write-Host "  - ATTENTION: Des processus PostgreSQL sont encore actifs!" -ForegroundColor Red
    Write-Host "    Redémarrez l'ordinateur pour les arrêter complètement." -ForegroundColor Yellow
} else {
    Write-Host "  - Aucun processus PostgreSQL actif" -ForegroundColor Green
}

# Vérifier les ports
$portsToCheck = @(5432, 5433, 5434)
foreach ($port in $portsToCheck) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  - Port $port encore utilisé (PID: $($connection.OwningProcess))" -ForegroundColor Yellow
    } else {
        Write-Host "  - Port $port libéré" -ForegroundColor Green
    }
}

# -----------------------------------------------------------------------------
# Résumé
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Nettoyage terminé!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Actions effectuées:" -ForegroundColor White
Write-Host "  - Services PostgreSQL arrêtés et désactivés"
Write-Host "  - Données PostgreSQL supprimées"
Write-Host "  - Docker nettoyé (si disponible)"
Write-Host ""
Write-Host "Recommandations:" -ForegroundColor Yellow
Write-Host "  - Redémarrez l'ordinateur pour finaliser le nettoyage"
Write-Host "  - Vérifiez dans 'Applications' si PostgreSQL apparaît encore"
Write-Host ""

Read-Host "Appuyez sur Entrée pour fermer"
