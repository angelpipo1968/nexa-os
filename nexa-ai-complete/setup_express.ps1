# Configuración Express para Nexa AI (Docker Architecture)
# Tiempo estimado: ~30 minutos (dependiendo de la velocidad de descarga)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando Nexa AI Express Setup..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Verificaciones Previas
Write-Host "`n🔍 Verificando prerrequisitos..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Node.js no encontrado. Por favor instálalo desde https://nodejs.org/"
    exit 1
}

try {
    $dockerVersion = docker --version
    Write-Host "  ✅ Docker detectado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Docker Desktop no encontrado o no está corriendo."
    Write-Host "  👉 Instala Docker Desktop: https://www.docker.com/products/docker-desktop/"
    Write-Host "  👉 Asegúrate de que esté iniciado."
    exit 1
}

# 2. Configuración del Frontend
Write-Host "`n📦 Preparando Frontend (React)..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  ⏳ Instalando dependencias de frontend..."
    npm install --silent
    
    Write-Host "  🔨 Construyendo aplicación para producción..."
    $env:CI = "false" # Evitar fallos por warnings en CI
    npm run build
    
    if (Test-Path "build") {
        Write-Host "  ✅ Build completado exitosamente." -ForegroundColor Green
    } else {
        Write-Error "❌ Falló el build del frontend."
        exit 1
    }
} else {
    Write-Error "❌ No se encontró package.json en el directorio actual."
    exit 1
}

# 3. Despliegue con Docker
Write-Host "`n🐳 Levantando contenedores (Nginx, Token API, Ollama, Redis)..." -ForegroundColor Yellow
Write-Host "  ⚠️  La primera vez esto puede tardar varios minutos (descarga de imágenes)." -ForegroundColor Gray

try {
    docker-compose up -d --build
    Write-Host "`n✅ ¡Infraestructura desplegada correctamente!" -ForegroundColor Green
} catch {
    Write-Error "❌ Falló docker-compose up. Verifica los logs anteriores."
    exit 1
}

# 4. Resumen y Siguientes Pasos
Write-Host "`n🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. 🌐 Interfaz Web:    http://localhost"
Write-Host "2. 🧠 API Tokens:      http://localhost:8087"
Write-Host "3. 🦙 Ollama API:      http://localhost:11434"
Write-Host ""
Write-Host "👉 PASO FINAL REQUERIDO:" -ForegroundColor Yellow
Write-Host "   Para activar la IA Local, ejecuta este comando en otra terminal:"
Write-Host "   docker exec -it nexa-ai-complete-ollama-1 ollama run llama3" -ForegroundColor White -BackgroundColor Black
Write-Host ""
