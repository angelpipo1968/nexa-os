#!/bin/bash

# NEXA OS - Script de Despliegue Automático (Unix/Linux/Mac)
# Autor: Sovereign Systems
# Fecha: 2026-01-06

echo "🚀 Iniciando secuencia de despliegue para NEXA OS..."

# Verificar Git
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado. Por favor instálalo primero."
    exit 1
fi

# Estado actual
echo "📊 Estado del repositorio:"
git status -s

# Confirmación
read -p "pausa: ¿Deseas continuar con el despliegue a GitHub? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "🛑 Despliegue cancelado."
    exit 1
fi

# Añadir cambios
echo "📦 Empaquetando cambios..."
git add .

# Commit
echo "📝 Ingresa el mensaje del commit (Enter para usar fecha actual):"
read commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Despliegue automático: $(date +'%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$commit_msg"

# Push
echo "⬆️  Subiendo a remoto..."
branch=$(git branch --show-current)
git push origin $branch

echo "✅ Despliegue completado con éxito."
echo "   - Vercel detectará el commit y reconstruirá el Frontend."
echo "   - Render detectará el commit y reconstruirá el Backend."
echo "🌐 Monitorea tu despliegue en: https://vercel.com/dashboard"
