import { Capacitor } from '@capacitor/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const AndroidAuthConfig = {
  // Almacenamiento seguro optimizado para Android (y iOS)
  storeData: async (key: string, value: string): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
      try {
        await SecureStoragePlugin.set({ key, value });
        return true;
      } catch (error) {
        console.error('Secure storage error:', error);
        return false;
      }
    } else {
        // Fallback para web
        localStorage.setItem(key, value);
        return true;
    }
  },

  // Obtener datos
  getData: async (key: string): Promise<string | null> => {
      if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
          try {
              const { value } = await SecureStoragePlugin.get({ key });
              return value;
          } catch (error) {
              // Si no existe, suele lanzar error
              return null;
          }
      } else {
          return localStorage.getItem(key);
      }
  },

  // Configuración de biometricos
  setupBiometricAuth: async (): Promise<{ fingerprint: boolean; faceID: boolean; iris: boolean } | null> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await NativeBiometric.isAvailable();
        
        if (result.isAvailable) {
          // Mapear tipos de biometría
          const isFingerprint = result.biometryType === BiometryType.FINGERPRINT || result.biometryType === BiometryType.TOUCH_ID || result.biometryType === BiometryType.MULTIPLE;
          const isFace = result.biometryType === BiometryType.FACE_AUTHENTICATION || result.biometryType === BiometryType.FACE_ID || result.biometryType === BiometryType.MULTIPLE;
          const isIris = result.biometryType === BiometryType.IRIS_AUTHENTICATION;

          return {
            fingerprint: isFingerprint,
            faceID: isFace,
            iris: isIris
          };
        }
      } catch (error) {
        console.error('Biometric setup error:', error);
      }
    }
    return null;
  },

  // Autenticación con huella digital / biometría
  authenticateWithBiometrics: async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const verified = await NativeBiometric.verifyIdentity({
          reason: "Autenticación requerida",
          title: "Iniciar Sesión",
          subtitle: "Usa tu huella o rostro",
          description: "Confirma tu identidad para acceder"
        });
        return true;
      } catch (error) {
        console.error('Biometric auth error:', error);
        return false;
      }
    }
    return false; // En web siempre retorna falso o simular
  }
};

export default AndroidAuthConfig;
