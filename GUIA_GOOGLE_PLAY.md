# Guía de Publicación en Google Play (Pruebas Internas)

Esta guía te ayudará a subir tu aplicación **NEXA OS** a Google Play Console para realizar pruebas (Internal Testing).

## 1. Archivo Generado
El archivo que necesitas subir ya ha sido generado exitosamente:
- **Archivo:** `app-release.aab` (Android App Bundle)
- **Ubicación:** `android/app/build/outputs/bundle/release/app-release.aab`

> **Nota:** Google Play ya no acepta archivos APK para nuevas aplicaciones, solo AAB.

## 2. Pasos en Google Play Console

1.  **Crear la Aplicación**:
    *   Ve a [Google Play Console](https://play.google.com/console).
    *   Haz clic en **"Crear aplicación"**.
    *   Nombre: `NEXA OS` (o el nombre que prefieras).
    *   Idioma predeterminado: Español.
    *   Tipo: App.
    *   Gratis/De pago: Gratis.

2.  **Configurar Pruebas Internas (Internal Testing)**:
    *   En el menú lateral izquierdo, ve a **Pruebas** > **Pruebas internas**.
    *   Haz clic en **"Crear nueva versión"**.

3.  **Subir el AAB**:
    *   En la sección "App bundles", arrastra y suelta el archivo `app-release.aab` que generamos.
    *   Espera a que se procese y se firme por Google Play.

4.  **Detalles de la Versión**:
    *   Nombre de la versión: `1.0` (o el sugerido).
    *   Notas de la versión: "Lanzamiento inicial de NEXA OS - Versión Modular con Memoria Neuronal".
    *   Haz clic en **"Guardar"** y luego en **"Revisar versión"**.

5.  **Añadir Testers**:
    *   En la pestaña **"Testers"** (dentro de Pruebas internas), crea una lista de correo con los emails de las personas que probarán la app (incluido tú mismo).
    *   Copia el **"Enlace para unirse a la prueba"** y ábrelo en tu dispositivo Android para descargar la app.

## 3. Actualizaciones Futuras
Cuando quieras actualizar la app:
1.  Pídele a NEXA (a mí) que actualice el código.
2.  Ejecutaré de nuevo la generación del AAB.
3.  Subes el nuevo archivo a una **nueva versión** en la misma sección de Pruebas internas.
4.  La actualización llegará automáticamente a tus dispositivos de prueba.

---
**Información Técnica de Firma:**
- Keystore: `android/app/release.keystore`
- Alias: `key0`
- Password: `password123`
*(Esta información ya está configurada automáticamente en el proyecto)*
