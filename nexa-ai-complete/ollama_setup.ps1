Param(
  [string]$Model = "phi3:mini"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando instalación y despliegue de Ollama..." -ForegroundColor Cyan

try {
  $os = (Get-CimInstance Win32_OperatingSystem).Caption
  Write-Host "🖥️  Sistema operativo: $os" -ForegroundColor Gray
} catch {}

function Ensure-OllamaInstalled {
  try {
    $v = ollama --version
    Write-Host "✅ Ollama detectado: $v" -ForegroundColor Green
    return $true
  } catch {
    Write-Host "ℹ️ Ollama no encontrado. Intentando instalar con winget..." -ForegroundColor Yellow
    try {
      winget install -e --id Ollama.Ollama -h
      Write-Host "✅ Ollama instalado." -ForegroundColor Green
      return $true
    } catch {
      Write-Host "❌ No se pudo instalar Ollama automáticamente. Instálalo manualmente: https://ollama.com/download" -ForegroundColor Red
      return $false
    }
  }
}

if (-not (Ensure-OllamaInstalled)) { exit 1 }

Write-Host "📦 Descargando modelo: $Model" -ForegroundColor Yellow
try {
  ollama pull $Model
} catch {
  Write-Host "❌ Falló la descarga del modelo. Revisa el nombre del modelo." -ForegroundColor Red
  exit 1
}

Write-Host "🧪 Verificando inferencia inicial..." -ForegroundColor Yellow
try {
  $warmup = ollama run $Model -p "Hola, ¿estás listo?"
  Write-Host "✅ Inferencia de calentamiento completada." -ForegroundColor Green
} catch {
  Write-Host "⚠️ No se pudo ejecutar inferencia de calentamiento, continuando..." -ForegroundColor Yellow
}

Write-Host "🌐 Verificando API de Ollama (http://localhost:11434)..." -ForegroundColor Yellow
$apiOk = $false
try {
  $tags = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 5
  if ($tags.models.Count -gt 0) { $apiOk = $true }
  Write-Host "✅ API activa, modelos disponibles: $($tags.models.Count)" -ForegroundColor Green
} catch {
  Write-Host "⚠️ No se pudo acceder a la API. Asegúrate de que el servicio de Ollama esté ejecutándose." -ForegroundColor Yellow
}

Write-Host "📝 Generando reporte HTML..." -ForegroundColor Yellow
try {
  $cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1).Name
  $ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
  $gpu = (Get-CimInstance Win32_VideoController | Select-Object -First 1).Name
  $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $status = if ($apiOk) { "OK" } else { "No disponible" }
  $html = @"
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Reporte Despliegue Ollama</title>
<style>body{font-family:Segoe UI,Arial;margin:20px;background:#0f172a;color:#e5e7eb}
h1{color:#93c5fd} code{background:#1f2937;padding:2px 4px;border-radius:4px}</style></head>
<body>
<h1>Reporte de Despliegue - Ollama</h1>
<p><strong>Fecha:</strong> $timestamp</p>
<p><strong>Modelo:</strong> $Model</p>
<p><strong>CPU:</strong> $cpu</p>
<p><strong>RAM:</strong> ${ramGB} GB</p>
<p><strong>GPU:</strong> $gpu</p>
<p><strong>API:</strong> $status</p>
<p>Comandos ejecutados:</p>
<ul>
  <li><code>ollama pull $Model</code></li>
  <li><code>ollama run $Model -p "Hola, ¿estás listo?"</code></li>
  <li><code>GET http://localhost:11434/api/tags</code></li>
</ul>
</body></html>
"@
  New-Item -ItemType Directory -Force -Path "reports" | Out-Null
  $reportPath = Join-Path (Get-Location) "reports/deployment_report.html"
  $html | Set-Content -Path $reportPath -Encoding UTF8
  Write-Host "✅ Reporte generado: $reportPath" -ForegroundColor Green
} catch {
  Write-Host "⚠️ No se pudo generar el reporte." -ForegroundColor Yellow
}

# Setup Token VM Dependencies
Write-Host "🔧 Configurando Token VM..." -ForegroundColor Yellow
try {
  $tokenVmPath = Join-Path $PSScriptRoot "token-vm"
  if (Test-Path $tokenVmPath) {
    Write-Host "   - Instalando dependencias en $tokenVmPath..." -ForegroundColor Gray
    Start-Process "npm" -ArgumentList "install" -WorkingDirectory $tokenVmPath -NoNewWindow -Wait
    Write-Host "✅ Dependencias de Token VM instaladas." -ForegroundColor Green
  } else {
    Write-Host "⚠️ No se encontró la carpeta token-vm." -ForegroundColor Yellow
  }
} catch {
  Write-Host "❌ Error configurando Token VM." -ForegroundColor Red
}

Write-Host "🎉 Instalación y verificación completadas." -ForegroundColor Cyan
Write-Host "👉 Para iniciar todo el sistema, ejecuta: .\start_all.ps1" -ForegroundColor Cyan
