#!/bin/bash

# ==========================================
# 🚀 NEXA OS - INSTALADOR AUTOMÁTICO DE SERVIDOR
# ==========================================
# Ejecuta este script en tu servidor Ubuntu/Debian para desplegar todo automáticamente.
# Uso: bash install_server.sh

set -e # Detener si hay errores

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}
  _   _ ________   __    _       ___  ____  
 | \ | |  _ \ \ / /   / \     / _ \/ ___| 
 |  \| | |_) \ V /   / _ \   | | | \___ \ 
 | |\  |  __/ | |   / ___ \  | |_| |___) |
 |_| \_|_|    |_|  /_/   \_\  \___/|____/ 
 
 >> INICIANDO SECUENCIA DE DESPLIEGUE AUTOMÁTICO <<
${NC}"

# 1. Variables de Configuración
REPO_URL="https://github.com/angelpipo1968/nexa-ai.dev.git"
APP_DIR="/var/www/nexa-os"
DOMAIN="nexa-ai.dev"

# 2. Actualización del Sistema
echo -e "${YELLOW}📦 [1/7] Actualizando paquetes del sistema...${NC}"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
sudo apt-get install -y curl git unzip build-essential

# 3. Instalación de Node.js (v18 LTS)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}🟢 [2/7] Instalando Node.js v18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js ya instalado: $(node -v)${NC}"
fi

# 4. Instalación de Servidor Web y SSL
echo -e "${YELLOW}🌐 [3/7] Instalando Nginx y Certbot...${NC}"
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 5. Instalación de PM2 (Gestor de Procesos)
echo -e "${YELLOW}⚙️ [4/7] Instalando PM2...${NC}"
sudo npm install -g pm2

# 6. Despliegue del Código
echo -e "${YELLOW}📂 [5/7] Configurando aplicación...${NC}"

# Crear directorio si no existe
if [ ! -d "$APP_DIR" ]; then
    echo "   Clonando repositorio..."
    sudo git clone "$REPO_URL" "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
else
    echo "   Actualizando repositorio existente..."
    cd "$APP_DIR"
    # Guardar cambios locales si los hay (stash) para evitar conflictos
    git stash
    git pull origin main
fi

cd "$APP_DIR"

echo "   Instalando dependencias (esto puede tardar)..."
npm install --legacy-peer-deps

echo "   Construyendo aplicación..."
npm run build

# 7. Configuración de Nginx
echo -e "${YELLOW}🔧 [6/7] Configurando Proxy Inverso (Nginx)...${NC}"
if [ -f "nexa.conf" ]; then
    sudo cp nexa.conf "/etc/nginx/sites-available/$DOMAIN"
    sudo ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/"
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Verificar sintaxis
    sudo nginx -t
    sudo systemctl restart nginx
else
    echo -e "${RED}❌ Error: No se encontró nexa.conf en el repositorio.${NC}"
fi

# 8. Lanzamiento de la App
echo -e "${YELLOW}🚀 [7/7] Lanzando aplicación...${NC}"
pm2 delete nexa-web 2>/dev/null || true
pm2 start npm --name "nexa-web" -- start
pm2 save
# Configurar inicio automático
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER | bash || true

echo -e "${GREEN}
======================================================
✅ DESPLIEGUE COMPLETADO EXITOSAMENTE
======================================================
1. Tu app está corriendo en: http://$DOMAIN (o http://IP)
2. Para activar HTTPS (Candado verde), ejecuta ahora:

   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

======================================================
${NC}"
