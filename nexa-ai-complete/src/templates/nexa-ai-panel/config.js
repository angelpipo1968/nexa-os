export const nexaConfig = {
  user: {
    name: "Ángel",
    role: "Administrador",
    welcomeMessage: "Tu portal de inteligencia artificial avanzada"
  },
  theme: {
    colors: {
      primary: "#4a4e69",
      secondary: "#e6e6fa",
      accent: "#d4af37",
      background: "#0a0a1a",
      textLight: "#f8f8f2",
      textDark: "#282a36",
      success: "#50fa7b",
      danger: "#ff5555"
    },
    effects: {
      glow: "0 0 20px rgba(212, 175, 55, 0.3)",
      blur: "backdrop-filter: blur(10px)",
      transition: "all 0.3s ease"
    }
  },
  features: [
    { id: 1, text: "Configuración IA Multiplataforma", active: true },
    { id: 2, text: "VisionForge Visual Tools", active: true },
    { id: 3, text: "Plantillas Qwen3 para Android", active: true }
  ],
  assistant: {
    placeholder: "Pregunta sobre Qwen, ipikay o cualquier cosa...",
    voiceEnabled: true
  },
  upload: {
    text: "Arrastra imágenes aquí o haz clic para subir",
    hint: "Soporta reconocimiento de texto, análisis de alineaciones planetarias, etc."
  }
};
