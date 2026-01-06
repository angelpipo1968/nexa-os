# Guía de Integración NEXA AI

Esta guía explica cómo integrar los componentes estáticos de NEXA AI en diferentes entornos.

## 1. Integración en Proyecto Web Existente (HTML/PHP/ASP)

Simplemente copia la carpeta `assets` a la raíz de tu sitio y vincula los archivos en tu `<head>`:

```html
<link rel="stylesheet" href="/assets/css/nexa-core.css">
<link rel="stylesheet" href="/assets/css/animations.css">
<script src="/assets/js/nexa-core.js" defer></script>
```

## 2. Migración a React

Si deseas mover estos templates a React (como en el proyecto principal `nexa-ai-complete`):

1.  **Estilos**: Importa los archivos CSS en tu `index.js` o `App.js`.
    ```javascript
    import './assets/css/nexa-core.css';
    ```
2.  **Componentes**: Convierte el HTML de `templates/` a JSX.
    *   Cambia `class` por `className`.
    *   Cierra todas las etiquetas (ej. `<input />`, `<br />`).
3.  **Lógica**: Mueve las clases de JS (`ChatEngine`, `OCRProcessor`) a hooks o utilidades dentro de `src/utils/`.

## 3. Despliegue en Android (WebView)

Para usar estas interfaces en una app Android:

1.  Coloca todo el contenido en la carpeta `assets` de tu proyecto Android Studio.
2.  Carga el archivo HTML en un WebView:
    ```java
    webView.loadUrl("file:///android_asset/templates/dashboard-premium.html");
    ```
3.  Habilita JavaScript en el WebView.

## 4. Personalización del Tema

Edita `assets/css/themes.css`. Puedes crear tu propio tema copiando la clase `.theme-premium` y cambiando las variables.

```css
.theme-mi-empresa {
  --primary: #0099ff;
  --accent: #ff9900;
  /* ... */
}
```

Luego aplícalo en el `<body>`: `<body class="theme-mi-empresa">`.

## 5. Configuración de APIs

Los componentes JS (`ChatEngine`, `OCRProcessor`) están listos para conectarse a APIs reales.

### Chat Engine (Ejemplo OpenAI)
```javascript
const chat = new ChatEngine('#chat-container', {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: 'sk-...', // Tu API Key
  model: 'gpt-4'
});
```

### OCR Processor
```javascript
const ocr = new OCRProcessor({
  endpoint: 'https://tu-api-ocr.com/analyze',
  apiKey: 'tu-api-key'
});

const result = await ocr.analyze(file);
```
Si no se proporciona configuración, los componentes funcionarán en **Modo Simulación** para pruebas.
