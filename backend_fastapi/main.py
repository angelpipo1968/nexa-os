from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import datetime
import hmac
import hashlib
import base64
import json
import random

app = FastAPI(title="NEXA OS Backend", version="1.0.0")

# --- Memoria Volátil ---
chat_memory = []

# Configuración CORS: Permitir tráfico desde cualquier origen (ajustar en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos de Datos ---
class WebhookPayload(BaseModel):
    event: str
    data: dict
    source: str = "nexa-system"

class ChatRequest(BaseModel):
    prompt: str
    model: str = "qwen:0.5b"

class RegisterRequest(BaseModel):
    email: str | None = None
    phone: str | None = None

# --- Funciones Auxiliares ---
async def send_discord_notification(message: str):
    """Envía notificaciones a Discord si WEBHOOK_URL está configurado."""
    webhook_url = os.getenv("WEBHOOK_URL")
    if not webhook_url:
        print(f"[LOG LOCAL] {message}")
        return

    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "content": f"**[NEXA OS Alert]** {message}",
                "username": "NEXA Sentinel"
            }
            await client.post(webhook_url, json=payload)
        except Exception as e:
            print(f"Error enviando a Discord: {e}")

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "system": "NEXA OS Backend",
        "status": "online",
        "time": datetime.datetime.now().isoformat()
    }

@app.get("/api/geo")
async def get_geo(request: Request):
    """
    Detecta la ubicación del usuario basándose en cabeceras de proxy (Vercel/Render).
    """
    # Intentar obtener IP y País de cabeceras estándar
    ip = request.headers.get("x-forwarded-for", request.client.host).split(",")[0]
    country = request.headers.get("x-vercel-ip-country", "Unknown")
    city = request.headers.get("x-vercel-ip-city", "Unknown")
    
    return {
        "ip": ip,
        "country": country,
        "city": city,
        "headers_debug": {k: v for k, v in request.headers.items() if "x-" in k.lower()}
    }

@app.post("/api/webhook")
async def webhook_handler(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """
    Recibe eventos del sistema y notifica a Discord en segundo plano.
    """
    msg = f"Evento recibido: `{payload.event}` desde `{payload.source}`"
    
    # Procesar notificación en background para no bloquear la respuesta
    background_tasks.add_task(send_discord_notification, msg)
    
    return {"status": "processed", "event": payload.event}

@app.post("/api/ai/chat")
async def ai_chat_proxy(request: ChatRequest):
    """
    Simulador de IA con memoria a corto plazo y personalidad.
    """
    global chat_memory
    
    # Guardar input del usuario
    chat_memory.append(f"User: {request.prompt}")
    if len(chat_memory) > 10: chat_memory.pop(0) # Mantener solo los últimos 10
    
    # Respuestas con estilo futurista
    responses = [
        "Analizando patrones de datos... Interesante.",
        "Mis sensores indican una probabilidad del 99% de éxito.",
        "Accediendo a la red neuronal global. Un momento.",
        "He procesado tu solicitud. Los resultados son prometedores.",
        "Sistema operativo estable. ¿En qué más puedo ayudarte?",
        "NEXA OS v3 en línea. Tus deseos son órdenes de código."
    ]
    
    ai_reply = random.choice(responses)
    
    # Lógica básica de conversación
    prompt_lower = request.prompt.lower()
    if "quien eres" in prompt_lower or "tu nombre" in prompt_lower:
        ai_reply = "Soy NEXA, una Inteligencia Artificial diseñada para optimizar tu vida digital."
    elif "hola" in prompt_lower:
        ai_reply = "Saludos, usuario. Sistemas listos."
    elif "ayuda" in prompt_lower:
        ai_reply = "Puedo ayudarte a organizar tareas, analizar datos o simplemente charlar."
        
    chat_memory.append(f"NEXA: {ai_reply}")
    
    return {
        "response": ai_reply,
        "history_snippet": chat_memory[-3:],
        "model": request.model,
        "source": "NEXA Core Logic"
    }

def sign_token(payload: dict, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    b64 = lambda obj: base64.urlsafe_b64encode(json.dumps(obj).encode()).rstrip(b"=").decode()
    h = b64(header)
    p = b64(payload)
    msg = f"{h}.{p}".encode()
    sig = hmac.new(secret.encode(), msg, hashlib.sha256).digest()
    s = base64.urlsafe_b64encode(sig).rstrip(b"=").decode()
    return f"{h}.{p}.{s}"

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    if not req.email and not req.phone:
        raise HTTPException(status_code=400, detail="email_or_phone_required")
    now = int(datetime.datetime.utcnow().timestamp())
    exp = now + 7 * 24 * 3600
    secret = os.getenv("AUTH_SECRET", "change_me")
    subject = (req.email or req.phone or "user").lower()
    payload = {"sub": subject, "email": req.email, "phone": req.phone, "iat": now, "exp": exp}
    token = sign_token(payload, secret)
    return {"token": token, "expires": exp, "user": {"email": req.email, "phone": req.phone}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
