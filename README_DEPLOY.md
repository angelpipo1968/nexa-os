# NEXA OS: Guía de Despliegue de Arquitectura Soberana
**Versión:** 1.0.0 | **Fecha:** 06-Ene-2026  
**Autor:** Ángel — Sovereign Systems  
**Clasificación:** Uso Técnico Interno

---

## 1. Arquitectura "El Banquete"
Este sistema utiliza una arquitectura distribuida para garantizar soberanía de datos, baja latencia y alta disponibilidad.

![Architecture Diagram](./architecture.mmd)

- **Frontend (Vercel):** Next.js 14 (Edge Network) para UI global.
- **Backend (Render):** FastAPI (Python 3.11) para lógica de negocio y webhooks.
- **Inteligencia (Local):** Ollama (Qwen/DeepSeek) corriendo en hardware propio, expuesto vía Túnel seguro.
- **Almacenamiento:** Distribuido (Local + Nube opcional).

---

## 2. Requisitos Previos
- **Cuentas:** GitHub, Vercel, Render, Namecheap.
- **Local:** Node.js v18+, Python 3.11+, Git.
- **Dominio:** Activo y configurado (ver sección DNS).

---

## 3. Estructura del Proyecto
El repositorio monorepo contiene:
- `/src/app/[lang]`: Frontend Next.js internacionalizado.
- `/backend_fastapi`: API Python con FastAPI.
- `render.yaml`: Infraestructura como código para Render.
- `vercel.json`: Reglas de enrutamiento y proxy inverso.

---

## 4. Proceso de Despliegue

### Paso 1: GitHub
1. Crear repositorio privado/público.
2. Subir código fuente (usar script `deploy.sh` adjunto).

### Paso 2: Vercel (Frontend)
1. Importar repositorio en [Vercel Dashboard](https://vercel.com/new).
2. **Root Directory:** `./` (Raíz).
3. **Framework Preset:** Next.js.
4. Vercel detectará automáticamente `vercel.json` para gestionar el proxy `/api/py`.

### Paso 3: Render (Backend)
1. Nuevo **Web Service** en [Render Dashboard](https://render.com/).
2. Conectar repositorio.
3. Render detectará `render.yaml`.
4. Añadir variable de entorno: `WEBHOOK_URL` (Tu URL de Discord/Slack).

### Paso 4: DNS (Namecheap)
Configurar Custom DNS apuntando a Vercel:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`
- `ns3.vercel-dns.com`
- `ns4.vercel-dns.com`

---

## 5. Verificación y Pruebas
1. **Webhook:** `POST https://tu-dominio.com/api/py/webhook` -> Verificar en Discord.
2. **Multilenguaje:**
   - `https://tu-dominio.com/es` (Español)
   - `https://tu-dominio.com/zh` (Chino)
3. **Seguridad:** Verificar candado HTTPS y cabeceras de seguridad.

---

## 6. Referencias
- [Vercel DNS Docs](https://vercel.com/docs/projects/domains)
- [Render Blueprints](https://render.com/docs/deploy#deploy-from-a-git-repository)
- [Namecheap DNS Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-settings/)
- [FastAPI Documentation](https://fastapi.tiangolo.com)

---
© 2026 Ángel — Sovereign Systems. Todos los derechos reservados.
