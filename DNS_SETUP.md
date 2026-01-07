# Configuración de Dominio Personalizado (DNS)
**Proveedor:** Namecheap (o cualquier otro registrador)
**Objetivo:** Conectar tu dominio (ej. `midominio.com`) a Vercel.

---

### Opción A: Usar los Nameservers de Vercel (Recomendado)
Esta es la opción más fácil y automática. Vercel gestionará todos los registros DNS por ti.

1. Ve a **Namecheap > Dashboard > Domain List**.
2. Haz clic en **Manage** junto a tu dominio.
3. En la sección **Nameservers**, selecciona **Custom DNS**.
4. Introduce estos 2 valores:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
5. Guarda los cambios (Check verde).
6. **En Vercel:**
   - Ve a Settings > Domains.
   - Añade tu dominio (ej. `midominio.com`).
   - Vercel detectará el cambio automáticamente (puede tardar hasta 48h, pero suele ser minutos).

---

### Opción B: Mantener DNS en Namecheap (Avanzado)
Si prefieres gestionar tus propios registros (por ejemplo, si tienes correo con otro proveedor).

1. Ve a **Namecheap > Advanced DNS**.
2. Añade los siguientes registros:

| Tipo | Host | Valor | TTL |
|------|------|-------|-----|
| **A** | `@` | `76.76.21.21` | Automatic |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic |

3. **En Vercel:**
   - Ve a Settings > Domains.
   - Añade `midominio.com` y `www.midominio.com`.

---

### Verificación
Una vez configurado, entra en tu dominio. Deberías ver:
1. La interfaz de NEXA OS.
2. Un indicador **"SYSTEM ONLINE"** en la esquina superior derecha (significa que el frontend ve al backend).
