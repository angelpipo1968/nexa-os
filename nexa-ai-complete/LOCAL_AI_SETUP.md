# Guía de Integración con IA Local (Self-Hosted)

Nexa OS Chat Interface está preparada para conectarse con servidores de IA ejecutándose en tu propia máquina.

## Opciones Soportadas (OpenAI Compatible)

El sistema soporta cualquier servidor que exponga una API compatible con OpenAI. A continuación, las configuraciones probadas:

### 1. LM Studio (Recomendado)
Es la opción más sencilla para empezar en Windows/Mac.

1. Descarga e instala [LM Studio](https://lmstudio.ai/).
2. Descarga un modelo (ej. `Llama 3`, `Mistral`).
3. Ve a la pestaña **Developer (Server)** (icono de `<->`).
4. Haz clic en **Start Server**.
   - URL por defecto: `http://localhost:1234`
5. **Configuración en Nexa**:
   - Ya está preconfigurado. Simplemente selecciona "Local AI" en el chat.
   - Si cambias el puerto, edita `.env.local`: `LOCAL_AI_URL=http://localhost:PUERTO/v1/chat/completions`

### 2. LocalAI
Alternativa open-source muy popular que corre en Docker.

**Instalación Rápida:**
```bash
git clone https://github.com/go-skynet/LocalAI
cd LocalAI
docker-compose up -d
```

**Configuración en Nexa:**
1. Edita `nexa-ai-complete/.env.local`.
2. Cambia la URL:
   ```env
   LOCAL_AI_URL=http://localhost:8080/v1/chat/completions
   ```
3. Reinicia el servidor proxy: `node dev-server.js`

### 3. Text Generation WebUI (Oobabooga)
Para usuarios avanzados que quieren control total sobre los parámetros de generación.

**Instalación:**
```bash
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
pip install -r requirements.txt
python server.py --api --listen
```
*Nota: Asegúrate de usar el flag `--api` para habilitar el endpoint.*

**Configuración en Nexa:**
1. Edita `nexa-ai-complete/.env.local`.
2. Cambia la URL (el puerto por defecto de la API suele ser 5000):
   ```env
   LOCAL_AI_URL=http://localhost:5000/v1/chat/completions
   ```
3. Reinicia el servidor proxy.

---

## Solución de Problemas

- **Error 502 (Bad Gateway)**: Significa que Nexa no puede conectar con tu servidor local.
  - Verifica que LM Studio/LocalAI esté corriendo.
  - Verifica que el puerto en `.env.local` coincida con el de tu servidor.
- **Respuestas vacías**: Algunos modelos locales requieren un formato de prompt específico. El proxy de Nexa intenta estandarizar esto, pero si falla, intenta usar un modelo "Instruct" o "Chat" en lugar de modelos "Base".
