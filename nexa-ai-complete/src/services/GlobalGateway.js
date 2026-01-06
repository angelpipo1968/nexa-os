
// NEXA AI v2.0 - Arquitectura Global
// 1. Nodos de Conexión Distribuidos
// 1.1 Gateway Global

class NetworkNode {
  constructor(id, type, region = 'global') {
    this.id = id;
    this.type = type;
    this.region = region;
    this.status = 'offline'; // online, offline, busy, error
    this.latency = 0;
    this.load = 0; // 0-100%
    this.lastHeartbeat = null;
  }

  connect() {
    this.status = 'online';
    this.lastHeartbeat = Date.now();
    this.latency = Math.floor(Math.random() * 50) + 10; // Simular latencia
    console.log(`[Node ${this.id}] Conectado a la red NEXA.`);
  }

  disconnect() {
    this.status = 'offline';
    this.latency = 0;
    this.load = 0;
    console.log(`[Node ${this.id}] Desconectado.`);
  }

  ping() {
    if (this.status === 'offline') return -1;
    this.lastHeartbeat = Date.now();
    // Simular fluctuación de latencia
    this.latency = Math.max(5, this.latency + (Math.random() * 10 - 5));
    return this.latency;
  }

  processRequest(payload) {
    if (this.status !== 'online') throw new Error(`Nodo ${this.id} no disponible.`);
    this.load = Math.min(100, this.load + 10);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.load = Math.max(0, this.load - 10);
        resolve({
          nodeId: this.id,
          timestamp: Date.now(),
          result: `Procesado por ${this.type} Node`,
          payload
        });
      }, this.latency * 2);
    });
  }
}

class GlobalGateway {
  constructor() {
    if (GlobalGateway.instance) {
      return GlobalGateway.instance;
    }
    
    this.nodes = new Map();
    this.requestQueue = [];
    this.subscribers = new Set();
    this.systemStatus = 'initializing';
    
    this.initializeCoreNodes();
    GlobalGateway.instance = this;
  }

  initializeCoreNodes() {
    // Inicializar nodos principales según la arquitectura v2.0
    this.registerNode(new NetworkNode('core-alpha-01', 'ORCHESTRATOR', 'us-east'));
    this.registerNode(new NetworkNode('chat-delta-99', 'LLM_INFERENCE', 'eu-west'));
    this.registerNode(new NetworkNode('vision-gamma-05', 'IMAGE_GEN', 'asia-ne'));
    this.registerNode(new NetworkNode('build-zeta-12', 'ANDROID_BUILDER', 'sa-east'));
    
    this.systemStatus = 'active';
    this.notifySubscribers();
  }

  registerNode(node) {
    this.nodes.set(node.id, node);
    node.connect();
    this.notifySubscribers();
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  // Distribución de carga inteligente
  routeRequest(type, payload) {
    const availableNodes = Array.from(this.nodes.values())
      .filter(n => n.type === type && n.status === 'online')
      .sort((a, b) => a.load - b.load || a.latency - b.latency);

    if (availableNodes.length === 0) {
      return Promise.reject(new Error(`No hay nodos disponibles para el tipo ${type}`));
    }

    const targetNode = availableNodes[0];
    console.log(`[Gateway] Enrutando solicitud a ${targetNode.id} (${targetNode.latency.toFixed(0)}ms)`);
    return targetNode.processRequest(payload);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const state = {
      status: this.systemStatus,
      nodes: this.getAllNodes(),
      activeNodes: this.getAllNodes().filter(n => n.status === 'online').length
    };
    this.subscribers.forEach(cb => cb(state));
  }

  // Simulación de latencia de red global
  simulateNetworkTraffic() {
    setInterval(() => {
      this.nodes.forEach(node => {
        if (node.status === 'online') {
          node.ping();
          // Simular carga aleatoria de fondo
          if (Math.random() > 0.7) node.load = Math.max(0, Math.min(100, node.load + (Math.random() * 20 - 10)));
        }
      });
      this.notifySubscribers();
    }, 2000);
  }
}

export const gateway = new GlobalGateway();
export default GlobalGateway;
