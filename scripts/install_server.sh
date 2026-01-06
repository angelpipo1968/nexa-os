#!/bin/bash

# ==============================================================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA - NEXA OS
# ==============================================================================
# Este script instala y configura NEXA OS en un servidor Ubuntu/Debian limpio.
# Uso: sudo ./install_server.sh [dominio]
# Ejemplo: sudo ./install_server.sh midominio.com
# ==============================================================================

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}       INICIANDO INSTALACIÓN DE NEXA OS SERVER        ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Verificar usuario root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR] Por favor ejecuta este script como root (sudo).${NC}"
    exit 1
fi

# 2. Configurar dominio
DOMAIN=${1:-nexa-ai.dev}
echo -e "${GREEN}[INFO] Dominio configurado: ${DOMAIN}${NC}"

# 3. Actualizar sistema
echo -e "${BLUE}[1/8] Actualizando paquetes del sistema...${NC}"
apt-get update && apt-get upgrade -y
apt-get install -y curl git unzip build-essential nginx certbot python3-certbot-nginx

# 4. Instalar Node.js (Versión 18 LTS o 20 LTS)
echo -e "${BLUE}[2/8] Instalando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}[INFO] Node.js ya está instalado: $(node -v)${NC}"
fi

# 5. Instalar PM2 (Process Manager)
echo -e "${BLUE}[3/8] Instalando PM2...${NC}"
npm install -g pm2

# 6. Preparar directorio de la aplicación
APP_DIR="/var/www/nexa-os"
echo -e "${BLUE}[4/8] Preparando directorio en $APP_DIR...${NC}"

# Si estamos corriendo este script desde dentro del repo, copiamos los archivos
# Si no, clonamos (aquí asumimos despliegue local o copia manual previa, o clonado)
if [ -d "./package.json" ]; then
    echo -e "${GREEN}[INFO] Detectado repositorio local. Copiando archivos...${NC}"
    mkdir -p $APP_DIR
    cp -r . $APP_DIR
else
    echo -e "${GREEN}[INFO] Clonando repositorio desde GitHub...${NC}"
    # Reemplaza esto con tu URL real si lo usas en un servidor virgen sin archivos
    git clone https://github.com/angelpipo1968/nexa-ai.dev.git $APP_DIR
fi

# Ajustar permisos
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# 7. Instalar dependencias y compilar
echo -e "${BLUE}[5/8] Instalando dependencias y construyendo aplicación...${NC}"
cd $APP_DIR
# Instalar dependencias como root (o cambiar a usuario si fuera necesario, pero root funciona en setup)
npm install --legacy-peer-deps

echo -e "${BLUE}      Compilando Next.js (esto puede tardar unos minutos)...${NC}"
# Aumentar memoria para build si es necesario en VPS pequeños
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 8. Configurar Nginx
echo -e "${BLUE}[6/8] Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 9. Configurar PM2
echo -e "${BLUE}[7/8] Iniciando aplicación con PM2...${NC}"
pm2 delete nexa-os 2>/dev/null || true
pm2 start npm --name "nexa-os" -- start
pm2 save
pm2 startup | tail -n 1 | bash # Ejecutar comando de startup sugerido

# 10. SSL con Certbot (Opcional interactivo)
echo -e "${BLUE}[8/8] Configuración SSL (HTTPS)...${NC}"
read -p "¿Deseas activar SSL gratis con Let's Encrypt ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect
    echo -e "${GREEN}[EXITO] SSL activado y redirección HTTPS configurada.${NC}"
else
    echo -e "${GREEN}[INFO] Saltando configuración SSL. Puedes ejecutar 'certbot --nginx' manualmente luego.${NC}"
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}       ¡INSTALACIÓN COMPLETADA CON ÉXITO!            ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Tu aplicación NEXA OS debería estar corriendo en: http://$DOMAIN"
echo -e "Directorio de la app: $APP_DIR"
echo -e "Comandos útiles:"
echo -e "  - Ver logs: pm2 logs nexa-os"
echo -e "  - Reiniciar: pm2 restart nexa-os"
echo -e "  - Estado: pm2 status"
