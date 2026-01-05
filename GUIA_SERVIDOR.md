# Guía de Configuración del Servidor (NEXA OS)

Esta guía te ayudará a configurar tu servidor (VPS Ubuntu/Debian) para alojar **NexaAI** con dominio personalizado, SSL y actualizaciones.

## 1. Configuración de DNS

Ve al panel de control de tu proveedor de dominio (GoDaddy, Namecheap, AWS Route53, etc.) y configura los siguientes registros:

| Tipo | Host / Nombre | Valor / Destino |
|------|---------------|-----------------|
| **A** | `@` (o nexa-ai.dev) | `TU_IP_DEL_SERVIDOR` |
| **A** | `www` | `TU_IP_DEL_SERVIDOR` |

> ⏳ **Nota:** Los cambios de DNS pueden tardar desde minutos hasta 24 horas en propagarse.

---

## 2. Preparar el Servidor

Conéctate a tu servidor por SSH y ejecuta:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (versión 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx y Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Instalar PM2 (Gestor de procesos)
sudo npm install -g pm2
```

---

## 3. Configurar el Proyecto

Sube tu código al servidor (usando Git o SCP) a la ruta `/var/www/nexa-os` (o donde prefieras).

```bash
cd /var/www/nexa-os

# Instalar dependencias
npm install

# Construir la aplicación
npm run build
```

---

## 4. Configurar Nginx (Servidor Web)

Copia el archivo de configuración que generamos:

```bash
# Copiar configuración
sudo cp nexa.conf /etc/nginx/sites-available/nexa-ai.dev

# Activar el sitio
sudo ln -s /etc/nginx/sites-available/nexa-ai.dev /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 5. Configurar SSL/TLS (HTTPS)

Usa Certbot para obtener certificados gratuitos de Let's Encrypt y configurar la redirección automática de HTTP a HTTPS.

```bash
sudo certbot --nginx -d nexa-ai.dev -d www.nexa-ai.dev
```

1.  Te pedirá un correo electrónico.
2.  Acepta los términos.
3.  **Importante:** Cuando pregunte si deseas redirigir el tráfico HTTP a HTTPS, elige **2 (Redirect)**.

---

## 6. Iniciar la Aplicación (PM2)

Usa PM2 para mantener tu aplicación corriendo en segundo plano.

```bash
# Iniciar Next.js (Puerto 3000)
pm2 start npm --name "nexa-web" -- start

# (Opcional) Si usas el servidor OTA separado en otro puerto
# pm2 start server.js --name "nexa-ota"

# Guardar lista de procesos para reinicios
pm2 save
pm2 startup
```

---

## ✅ Verificación Final

1.  Abre `https://nexa-ai.dev` en tu navegador.
2.  Deberías ver el candado de seguridad (SSL) y la aplicación funcionando.
