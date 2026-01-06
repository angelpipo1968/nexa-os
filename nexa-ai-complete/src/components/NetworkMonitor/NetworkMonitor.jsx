import React from 'react';
import { useGateway } from '../../hooks/useGateway';
import { Server, Activity, Globe, Wifi } from 'lucide-react';

const NetworkMonitor = () => {
  const { nodes, status, activeNodes } = useGateway();

  const getStatusColor = (nodeStatus) => {
    switch(nodeStatus) {
      case 'online': return 'var(--success)';
      case 'busy': return 'var(--warning, #ffaa00)';
      case 'offline': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="module-container">
      <h2><Globe size={24} style={{marginRight: '10px', verticalAlign: 'middle'}}/> Arquitectura Global NEXA v2.0</h2>
      
      <div className="network-stats">
        <div className="stat-card">
          <Activity size={20} color="var(--primary)" />
          <div className="stat-info">
            <span className="stat-value">{status.toUpperCase()}</span>
            <span className="stat-label">Estado del Gateway</span>
          </div>
        </div>
        <div className="stat-card">
          <Server size={20} color="var(--secondary)" />
          <div className="stat-info">
            <span className="stat-value">{activeNodes} / {nodes.length}</span>
            <span className="stat-label">Nodos Activos</span>
          </div>
        </div>
      </div>

      <h3 style={{marginTop: '2rem', color: 'var(--text-muted)'}}>Nodos de Conexión Distribuidos</h3>
      
      <div className="nodes-grid">
        {nodes.map(node => (
          <div key={node.id} className="node-card" style={{borderColor: getStatusColor(node.status)}}>
            <div className="node-header">
              <span className="node-type">{node.type}</span>
              <Wifi size={16} color={getStatusColor(node.status)} />
            </div>
            <div className="node-id">{node.id}</div>
            <div className="node-region">{node.region.toUpperCase()}</div>
            
            <div className="node-metrics">
              <div className="metric">
                <label>Latencia</label>
                <div className="metric-bar-bg">
                  <div className="metric-bar-fill" style={{width: `${Math.min(100, node.latency)}%`, background: 'var(--primary)'}}></div>
                </div>
                <span>{node.latency.toFixed(0)}ms</span>
              </div>
              <div className="metric">
                <label>Carga</label>
                <div className="metric-bar-bg">
                  <div className="metric-bar-fill" style={{width: `${node.load}%`, background: 'var(--secondary)'}}></div>
                </div>
                <span>{node.load.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkMonitor;
