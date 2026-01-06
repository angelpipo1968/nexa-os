# NEXA OS - Script de Despliegue Automático (Windows PowerShell)
# Autor: Sovereign Systems
# Fecha: 2026-01-06

Write-Host "🚀 Iniciando secuencia de despliegue para NEXA OS..." -ForegroundColor Cyan

# Verificar Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git no está instalado." -ForegroundColor Red
    exit
}

# Estado actual
Write-Host "📊 Estado del repositorio:" -ForegroundColor Yellow
git status -s

# Confirmación
$confirmation = Read-Host "pausa: ¿Deseas continuar con el despliegue a GitHub? (s/n)"
if ($confirmation -notmatch "^[Ss]$") {
    Write-Host "🛑 Despliegue cancelado." -ForegroundColor Red
    exit
}

# Añadir cambios
Write-Host "📦 Empaquetando cambios..." -ForegroundColor Cyan
git add .

# Commit
$commit_msg = Read-Host "📝 Ingresa el mensaje del commit (Enter para usar fecha actual)"
if ([string]::IsNullOrWhiteSpace($commit_msg)) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commit_msg = "Despliegue automático: $date"
}
git commit -m "$commit_msg"

# Push
Write-Host "⬆️  Subiendo a remoto..." -ForegroundColor Cyan
$branch = git branch --show-current
git push origin $branch

Write-Host "✅ Despliegue completado con éxito." -ForegroundColor Green
Write-Host "   - Vercel detectará el commit y reconstruirá el Frontend."
Write-Host "   - Render detectará el commit y reconstruirá el Backend."
Write-Host "🌐 Monitorea tu despliegue en: https://vercel.com/dashboard"
