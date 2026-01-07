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

app = FastAPI(title="NEXA OS Backend", version="1.0.0")

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
    Proxy para IA Local.
    En el futuro, esto conectará con tu túnel seguro (ngrok/cloudflared) hacia Ollama.
    """
    # TODO: Conectar con túnel local
    # local_tunnel_url = os.getenv("LOCAL_AI_URL") 
    
    return {
        "response": f"Simulación: Recibí tu prompt '{request.prompt}'. (El túnel a Ollama aún no está configurado)",
        "model": request.model,
        "source": "Cloud Mock"
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
