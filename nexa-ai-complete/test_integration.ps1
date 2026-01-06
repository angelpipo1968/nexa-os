# Test Integration Script: Full System Health Check

$ErrorActionPreference = "Stop"

function Test-Step {
    param($Name, $ScriptBlock)
    Write-Host "`n🧪 Probando: $Name..." -ForegroundColor Cyan -NoNewline
    try {
        & $ScriptBlock
        Write-Host " [OK]" -ForegroundColor Green
    } catch {
        Write-Host " [FALLÓ]" -ForegroundColor Red
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
             $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
             Write-Host "   Detalle: $($reader.ReadToEnd())" -ForegroundColor Red
        }
    }
}

Write-Host "🚀 Iniciando Pruebas de Sistema Completo Nexa OS..." -ForegroundColor Magenta

# 1. Ollama Direct Check
Test-Step "Ollama Core (Puerto 11434)" {
    $res = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2
    if ($res.models.Count -eq 0) { throw "Ollama está corriendo pero no tiene modelos." }
    Write-Host "`n   - Modelos detectados: $($res.models.Count)" -ForegroundColor Gray
}

# 2. Token VM Models Endpoint
Test-Step "Token VM - Listar Modelos (Puerto 3002)" {
    $res = Invoke-RestMethod -Uri "http://localhost:3002/v1/models" -Method Post -Headers @{ Authorization = "Bearer local-key" }
    if ($res.data.Count -eq 0) { throw "Token VM no devolvió modelos." }
    Write-Host "`n   - Modelos vía VM: $($res.data[0].id)" -ForegroundColor Gray
}

# 3. Web Search Proxy
Test-Step "Búsqueda Web (Proxy 8087 -> VM 3002 -> Internet)" {
    $payload = @{ query = "Nexa OS AI" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "http://localhost:8087/api/proxy/web-search" -Method Post -Body $payload -ContentType "application/json"
    if ($res.results.Count -eq 0) { throw "No se obtuvieron resultados de búsqueda." }
    Write-Host "`n   - Primer resultado: $($res.results[0].title)" -ForegroundColor Gray
}

# 4. Full AI Generation Flow
Test-Step "Generación de IA (Proxy -> VM -> Ollama)" {
    $payload = @{
        model = "local-model"
        messages = @(
            @{ role = "user"; content = "Di 'Sistema Operativo' en una palabra." }
        )
        stream = $false
    } | ConvertTo-Json
    
    $res = Invoke-RestMethod -Uri "http://localhost:8087/api/proxy/local" -Method Post -Body $payload -ContentType "application/json"
    $content = $res.choices[0].message.content
    if ([string]::IsNullOrWhiteSpace($content)) { throw "Respuesta vacía de la IA." }
    Write-Host "`n   - Respuesta IA: $content" -ForegroundColor Gray
}

Write-Host "`n✅ PRUEBAS COMPLETADAS. Todo el sistema está operativo." -ForegroundColor Green
