import { useState, useEffect } from 'react';
import { gateway } from '../services/GlobalGateway';

export const useGateway = () => {
  const [networkState, setNetworkState] = useState({
    status: gateway.systemStatus,
    nodes: gateway.getAllNodes(),
    activeNodes: 0
  });

  useEffect(() => {
    // Iniciar simulación de tráfico si no está activa
    // (En un entorno real esto sería automático o manejado por el servidor)
    gateway.simulateNetworkTraffic();

    const unsubscribe = gateway.subscribe((state) => {
      setNetworkState(state);
    });

    // Estado inicial
    setNetworkState({
      status: gateway.systemStatus,
      nodes: gateway.getAllNodes(),
      activeNodes: gateway.getAllNodes().filter(n => n.status === 'online').length
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};
