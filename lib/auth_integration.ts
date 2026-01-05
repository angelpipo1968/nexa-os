import AndroidAuthConfig from './AndroidAuthConfig';

const EnhancedAuthService = {
  // Almacenar usuario de forma segura
  storeUserSecure: async (user: any): Promise<boolean> => {
    try {
      const value = JSON.stringify(user);
      return await AndroidAuthConfig.storeData('user_session', value);
    } catch (error) {
      console.error('Error storing user secure:', error);
      return false;
    }
  },

  // Obtener usuario almacenado
  getSecureUser: async (): Promise<any | null> => {
    try {
      const value = await AndroidAuthConfig.getData('user_session');
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving secure user:', error);
      return null;
    }
  },

  // Configurar biometría
  setupBiometricAuth: async () => {
    return await AndroidAuthConfig.setupBiometricAuth();
  },

  // Autenticar con biometría
  authenticateWithBiometrics: async (): Promise<boolean> => {
    return await AndroidAuthConfig.authenticateWithBiometrics();
  }
};

export default EnhancedAuthService;
