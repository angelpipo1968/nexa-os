from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import geoip2.database
import httpx
import os

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de datos para Webhook
class WebhookPayload(BaseModel):
    event: str
    data: dict

@app.get("/")
async def root():
    return {"message": "NEXA OS Backend (FastAPI) is running"}

@app.get("/api/geo")
async def get_geo(request: Request):
    # Simulación de GeoIP para desarrollo local
    # En producción, usarías una base de datos real o leerías headers de Cloudflare/Vercel
    client_ip = request.client.host
    
    # Mock response por ahora
    return {
        "ip": client_ip,
        "country": "Unknown",
        "city": "Unknown",
        "lat": 0.0,
        "lon": 0.0
    }

@app.post("/api/webhook")
async def webhook_handler(payload: WebhookPayload):
    print(f"Recibido evento webhook: {payload.event}")
    # Aquí iría la lógica para procesar eventos externos
    return {"status": "received", "event": payload.event}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
