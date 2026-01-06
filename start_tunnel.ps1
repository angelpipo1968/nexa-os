# Script para iniciar un túnel seguro a tu IA Local (Ollama)
# Esto permite que tu Backend en la Nube (Railway/Render) hable con tu PC.

Write-Host "🚀 Iniciando Configuración de Túnel para NEXA OS..." -ForegroundColor Cyan

# 1. Verificar si Ngrok está instalado
if (Get-Command "ngrok" -ErrorAction SilentlyContinue) {
    Write-Host "✅ Ngrok detectado." -ForegroundColor Green
} else {
    Write-Host "⚠️ Ngrok no encontrado." -ForegroundColor Yellow
    Write-Host "Por favor descarga Ngrok de: https://ngrok.com/download"
    Write-Host "Descomprímelo y ponlo en una carpeta en tu PATH (o en esta misma carpeta)."
    exit
}

# 2. Verificar si Ollama está corriendo
$ollamaPort = 11434
$conn = Test-NetConnection -ComputerName localhost -Port $ollamaPort -InformationLevel Quiet
if (-not $conn) {
    Write-Host "❌ Ollama no parece estar corriendo en el puerto $ollamaPort." -ForegroundColor Red
    Write-Host "Por favor inicia Ollama primero (abre otra terminal y ejecuta 'ollama serve')."
    exit
} else {
    Write-Host "✅ Ollama detectado en el puerto $ollamaPort." -ForegroundColor Green
}

# 3. Iniciar el túnel
Write-Host "`n🌐 Abriendo túnel a Internet..." -ForegroundColor Cyan
Write-Host "Copia la URL que dice 'Forwarding' (ej: https://xxxx-xx.ngrok-free.app) y úsala en tu Backend." -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener el túnel.`n"

ngrok http $ollamaPort
