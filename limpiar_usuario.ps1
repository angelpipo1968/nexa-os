# Script de limpieza avanzado para C:\Users\pipog
# Elimina todas las carpetas que empiezan con "nexa" EXCEPTO "nexa-os-complete"

$targetDir = "C:\Users\pipog"
$projectDirName = "nexa-os-complete"

Write-Host "Iniciando limpieza de carpetas 'nexa' en $targetDir..."
Write-Host "PRESERVANDO PROYECTO ACTUAL: $projectDirName"
Write-Host "---------------------------------------------------"

# 1. Obtener todas las carpetas que empiezan con "nexa" (insensible a mayúsculas/minúsculas)
$nexaFolders = Get-ChildItem -Path $targetDir -Directory -Filter "nexa*"

foreach ($folder in $nexaFolders) {
    if ($folder.Name -ne $projectDirName) {
        Write-Host "Eliminando: $($folder.FullName)"
        Remove-Item -Path $folder.FullName -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "SALTANDO (PROTEGIDO): $($folder.FullName)" -ForegroundColor Green
    }
}

# 2. Limpieza de archivos basura detectados anteriormente (por si acaso)
$junkFiles = @(
    "(", "({", "({}))", "[...prev", "m.role", "nexa-os@1.0.0", "{", "Micrófono.'", 
    "App.js", "package.json", "cd", "next", "npm", ".next", "app", "src", "nexa-os"
)

foreach ($item in $junkFiles) {
    $fullPath = Join-Path $targetDir $item
    if (Test-Path -LiteralPath $fullPath) {
        Write-Host "Eliminando basura: $fullPath"
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "---------------------------------------------------"
Write-Host "¡Limpieza completada! Solo debería quedar 'nexa-os-complete'."
 
 $desktopPaths = @("C:\Users\pipog\Desktop", "C:\Users\pipog\OneDrive\Desktop")
 foreach ($desktop in $desktopPaths) {
     if (Test-Path $desktop) {
         Get-ChildItem -Force $desktop | ForEach-Object {
             try {
                 Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop
             } catch {
             }
         }
     }
 }
 
 try {
     Clear-RecycleBin -Force -ErrorAction Stop -Confirm:$false
 } catch {
 }
