# Especificaciones de Arquitectura NEXA AI v2.0

Este documento detalla cómo la implementación actual cumple con los requisitos críticos de negocio.

## 1. Escalabilidad Horizontal (Millions of Users)
**Implementación:**
- **Gateway Distribuido:** `backend/gateway/index.js` utiliza `http-proxy-middleware` para balancear la carga entre clusters regionales.
- **Backend Stateless:** Los servicios están diseñados para ser replicados horizontalmente (definido en `infrastructure/terraform/main.tf` mediante `count` dinámico).
- **Cassandra:** Base de datos NoSQL diseñada para escalabilidad lineal.

## 2. Latencia < 150ms (Global)
**Implementación:**
- **Enrutamiento Geo-Inteligente:** El gateway (`backend/gateway/index.js`) intercepta la IP del usuario, resuelve su región (NA, EU, ASIA) y enruta la petición al nodo más cercano.
- **Procesamiento en el Borde:** La lógica de decisión ocurre antes de tocar la base de datos central.

## 3. Cumplimiento Normativo (GDPR, CCPA, HIPAA)
**Implementación:**
- **Derecho al Olvido / Retención:** `infrastructure/cassandra/schema.cql` define `default_time_to_live = 15552000` (180 días) en tablas de logs. Los datos se eliminan automáticamente.
- **Residencia de Datos:** El esquema de Cassandra permite definir en qué Data Center se almacenan los datos (`replication` strategy).
- **Encriptación:** `backend/security/encryption.js` provee encriptación AES-GCM 256-bit para datos sensibles (PHI/PII) en tránsito y reposo.

## 4. Resiliencia ante Fallos (Multi-Zona)
**Implementación:**
- **Replicación de Datos:** `NetworkTopologyStrategy` en Cassandra asegura que cada dato tenga 3 copias en US-EAST, 2 en EU-WEST, etc. Si una región cae, las otras sirven la data.
- **Infraestructura como Código:** Terraform (`infrastructure/terraform/global.tfvars`) permite redesplegar regiones enteras en minutos.
- **IPFS Redundante:** Los archivos se "pinean" en múltiples proveedores (Cloudflare, Pinata) para evitar puntos únicos de fallo.
