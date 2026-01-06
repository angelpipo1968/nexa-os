# 🐳 Guía de Despliegue con Docker (Arquitectura Microservicios)

Esta configuración implementa una arquitectura completa de "Máquina Virtual" con servicios separados para el proxy, base de datos, IA local y servidor web.

## 🏗️ Arquitectura
*   **Nginx (Puerto 80)**: Gateway principal y servidor web.
*   **Token API (Puerto 8087)**: Servicio de proxy y gestión de tokens (Node.js).
*   **Redis (Puerto 6379)**: Base de datos para registro de uso de tokens de alto rendimiento.
*   **Ollama (Puerto 11434)**: Motor de IA local (LLM).

## 🚀 Inicio Rápido

### 1. Construir el Frontend
Para que Nginx pueda servir la aplicación web, primero debes generar los archivos estáticos:
```bash
npm run build
```

### 2. Iniciar los Servicios
Ejecuta Docker Compose para levantar toda la infraestructura:
```bash
docker-compose up -d --build
```

### 3. Acceso
*   **Web UI**: [http://localhost](http://localhost)
*   **API Directa**: [http://localhost:8087](http://localhost:8087)
*   **Ollama API**: [http://localhost:11434](http://localhost:11434)

## ⚙️ Configuración de Modelos Locales

El servicio `ollama` se iniciará vacío. Necesitas descargar un modelo:

1.  Accede al contenedor de Ollama:
    ```bash
    docker exec -it nexa-ai-complete-ollama-1 ollama run llama3
    ```
    *(Esto descargará y ejecutará Llama 3. Puedes salir con Ctrl+D una vez cargado)*

2.  En la interfaz de Nexa (Chat), selecciona **"Local AI"**.

## 📊 Visualización de Datos (Redis)

Los datos de uso de tokens se guardan en Redis. Para inspeccionarlos:
```bash
docker exec -it nexa-ai-complete-redis-1 redis-cli
KEYS *
HGETALL nexa:usage:summary:anthropic
LRANGE nexa:usage:history 0 5
```
