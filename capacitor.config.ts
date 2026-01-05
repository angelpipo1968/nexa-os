import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "dev.nexa.ai",
  appName: "NexaAI",
  webDir: "out",
  // Para conectar a tu servidor desplegado (Vercel) y habilitar la IA,
  // descomenta la siguiente línea y pon tu URL real:
  // server: {
  //   url: "https://tu-proyecto-nexa.vercel.app",
  //   cleartext: true
  // },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
