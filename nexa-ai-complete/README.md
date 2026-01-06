# Nexa AI Interface

Una interfaz de chat moderna y robusta diseñada para el sistema operativo Nexa OS, con soporte para múltiples proveedores de IA y una arquitectura híbrida (Nube + Local).

## 🚀 Características Principales

*   **Multi-Proveedor**: Soporte integrado para Anthropic (Claude 3), Google (Gemini Pro), Alibaba (Qwen) y Modelos Locales.
*   **Arquitectura Híbrida**: Combina la potencia de la nube con la privacidad y coste cero de la IA local.
*   **Proxy Seguro**: Servidor intermedio (`dev-server.js`) que maneja las claves API de forma segura y resuelve problemas de CORS.
*   **Gestión de Tokens**: Sistema de registro y estimación de uso de tokens para todos los proveedores (incluido Local AI).
*   **Interfaz React Moderna**: Construida con Ant Design, incluye selección de modelos, gestión de prompts y diseño responsivo.

## 🛠️ Instalación y Configuración

### 1. Prerrequisitos
*   Node.js (v16 o superior)
*   NPM

### 2. Instalación de Dependencias
```bash
cd nexa-ai-complete
npm install
```

### 3. Configuración de Entorno
Crea o edita el archivo `.env.local` en la raíz del proyecto:
```env
# Claves API (Opcionales si usas solo Local AI)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
QWEN_API_KEY=...

# Configuración Local AI
LOCAL_AI_URL=http://localhost:1234/v1/chat/completions
```

### 4. Ejecución
Para iniciar el sistema completo, necesitas correr tanto el servidor proxy (backend) como la interfaz (frontend).

**Terminal 1 (Backend Proxy):**
```bash
node dev-server.js
```
*El servidor correrá en http://localhost:8087*

**Terminal 2 (Frontend):**
```bash
npm start
```
*La aplicación abrirá en http://localhost:3000*

## 🏠 Integración con IA Local (Self-Hosted)

Nexa AI soporta nativamente servidores locales compatibles con OpenAI como **LM Studio**, **LocalAI** y **Text Generation WebUI**.

Para instrucciones detalladas de configuración, consulta: [LOCAL_AI_SETUP.md](./LOCAL_AI_SETUP.md)

## 📊 Gestión de Tokens

El sistema registra automáticamente el uso de tokens en `usage.json`.
- **Cloud AI**: Utiliza los datos reales devueltos por la API.
- **Local AI**: Estima el consumo (aprox. 4 caracteres = 1 token) si el servidor no proporciona datos de uso.

Puedes ver un reporte en tiempo real en la consola donde ejecutas `dev-server.js`.

---
*Desarrollado para Nexa OS*
