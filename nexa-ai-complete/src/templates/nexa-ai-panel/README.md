# 📦 Paquete NEXA AI - Panel Premium

Este paquete contiene todos los archivos necesarios para implementar el panel de control NEXA AI en tu proyecto React.

## 🚀 Contenido del Paquete

1.  **DashboardTemplate.jsx**: El componente principal del panel.
2.  **config.js**: Archivo de configuración centralizada para textos, colores y características.
3.  **theme.css**: Hoja de estilos con el sistema de diseño Premium (Indigo/Dorado).

## 🛠️ Cómo Usar

1.  **Instalar Dependencias**:
    Asegúrate de tener instaladas las siguientes librerías:
    ```bash
    npm install ant-design @ant-design/icons react-highlight
    ```

2.  **Importar el Componente**:
    En tu archivo `App.js` o donde desees mostrar el panel:

    ```jsx
    import NexaDashboardTemplate from './templates/nexa-ai-panel/DashboardTemplate';

    function App() {
      return (
        <div className="App">
          <NexaDashboardTemplate />
        </div>
      );
    }
    ```

3.  **Personalizar**:
    Edita el archivo `config.js` para cambiar:
    *   Nombre de usuario y rol.
    *   Colores del tema.
    *   Lista de funcionalidades.
    *   Textos de ayuda.

## 🎨 Sistema de Diseño

El panel utiliza variables CSS modernas para facilitar la personalización. Puedes encontrar y modificar estas variables en `theme.css`.

*   `--nexa-primary`: Color principal (Fondo degradado)
*   `--nexa-accent`: Color de acento (Botones, iconos)
*   `--nexa-background`: Color de fondo base

¡Disfruta construyendo con NEXA AI!
