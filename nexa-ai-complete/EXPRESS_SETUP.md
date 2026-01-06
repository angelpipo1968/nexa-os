# 🚀 Nexa AI: Setup Express

Esta solución despliega una arquitectura de **Máquina Virtual Completa** en tu ordenador local, orquestando múltiples servicios para garantizar privacidad, control y cero costes.

## 🎯 Beneficios de Esta Solución

*   ✅ **Tokens "ilimitados"**: Solo limitados por la capacidad de tu hardware (CPU/GPU/RAM).
*   ✅ **Costo Cero**: Después de la instalación, no hay tarifas mensuales ni pagos por token.
*   ✅ **Privacidad Total**: Tus datos y prompts nunca salen de tu red local (Docker Container).
*   ✅ **Sin Límites**: Sin "throttling", sin límites de peticiones por minuto.
*   ✅ **Control Total**: Tú decides qué modelo usar (Llama 3, Mistral, Gemma, etc.) y cuándo actualizarlo.

---

## ⚡ Guía de Instalación Rápida (30 Minutos)

Hemos automatizado todo el proceso en un script.

### 1. Prerrequisitos
*   **Docker Desktop** instalado y corriendo.
*   **Node.js** instalado.

### 2. Ejecutar Script de Instalación
Abre PowerShell en la carpeta `nexa-ai-complete` y ejecuta:

```powershell
.\setup_express.ps1
```

*El script se encargará de:*
1.  Verificar herramientas.
2.  Instalar dependencias del proyecto.
3.  Compilar la interfaz gráfica (Frontend).
4.  Construir y levantar los 4 contenedores Docker (Nginx, API, Redis, Ollama).

### 3. Activar el Modelo (Solo primera vez)
Una vez finalizado el script, descarga el "cerebro" de la IA:

```bash
docker exec -it nexa-ai-complete-ollama-1 ollama run llama3
```
*(Puedes cambiar `llama3` por `mistral`, `gemma:2b`, etc.)*

---

## 🏗️ Arquitectura Desplegada

| Servicio | Puerto | Función |
|----------|--------|---------|
| **Nginx** | `80` | Servidor Web y Gateway Principal (Acceso UI) |
| **Token API** | `8087` | Proxy inteligente y gestor de claves |
| **Redis** | `6379` | Base de datos de alto rendimiento para logs |
| **Ollama** | `11434` | Motor de inferencia de IA Local |

## 🔍 Verificación
Accede a **[http://localhost](http://localhost)**. Deberías ver la interfaz de Nexa AI.
Selecciona **"Local AI"** en el selector de modelos y ¡listo!
