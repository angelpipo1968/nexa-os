# Start All Script for Nexa OS + Local AI
# Checks for Ollama, starts Token VM, and starts Main Dev Server

Write-Host "🚀 Iniciando Nexa OS + Local AI Environment..." -ForegroundColor Cyan

# 1. Check if Ollama is running
$ollamaProcess = Get-Process ollama -ErrorAction SilentlyContinue
if (-not $ollamaProcess) {
    Write-Host "⚠️  Ollama no está corriendo. Iniciando Ollama..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -NoNewWindow
    Start-Sleep -Seconds 5
} else {
    Write-Host "✅ Ollama ya está activo." -ForegroundColor Green
}

# 2. Start Token VM (Microservice)
Write-Host "💎 Iniciando Token VM (Puerto 3002)..." -ForegroundColor Cyan
$tokenVmPath = Join-Path $PSScriptRoot "token-vm"
Start-Process "node" -ArgumentList "server.js" -WorkingDirectory $tokenVmPath -NoNewWindow
Start-Sleep -Seconds 2

# 3. Start Backend Proxy (Dev Server)
Write-Host "🔌 Iniciando Proxy Server (Puerto 8087)..." -ForegroundColor Cyan
Start-Process "node" -ArgumentList "dev-server.js" -WorkingDirectory $PSScriptRoot -NoNewWindow
Start-Sleep -Seconds 2

# 4. Start Frontend
Write-Host "🌐 Iniciando Frontend Nexa OS..." -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Proxy:    http://localhost:8087" -ForegroundColor Gray
Write-Host "   - Token VM: http://localhost:3002" -ForegroundColor Gray

# Using npm start
npm start
