import React from 'react';
import { useGateway } from '../../hooks/useGateway';
import { Server, Activity, Globe, Wifi, Zap, Cpu } from 'lucide-react';
import './NetworkMonitor.css';

const NetworkMonitor = () => {
  const { nodes, status, activeNodes } = useGateway();

  const getStatusClass = (nodeStatus) => {
    switch(nodeStatus) {
      case 'online': return 'status-online';
      case 'busy': return 'status-busy';
      case 'offline': return 'status-offline';
      default: return '';
    }
  };

  const getPulseClass = (nodeStatus) => {
    switch(nodeStatus) {
      case 'online': return 'pulse-online';
      case 'busy': return 'pulse-busy';
      case 'offline': return 'pulse-offline';
      default: return '';
    }
  };

  const getBarColor = (value, type) => {
    if (type === 'latency') {
      return value < 50 ? 'var(--success)' : value < 100 ? 'var(--warning)' : 'var(--danger)';
    }
    // load
    return value < 60 ? 'var(--success)' : value < 85 ? 'var(--warning)' : 'var(--danger)';
  };

  return (
    <div className="network-monitor-container">
      <div className="network-header">
        <h2 className="network-title">
          <Globe size={32} style={{marginRight: '12px', verticalAlign: 'middle', color: 'var(--neon-cyan)'}}/> 
          Arquitectura Global NEXA
        </h2>
        <p className="network-subtitle">Monitoreo en tiempo real de la red neuronal distribuida</p>
      </div>
      
      <div className="status-summary">
        <div className="glass-card summary-item">
          <Activity size={24} color="var(--neon-cyan)" style={{marginBottom: '8px'}} />
          <span className="summary-value" style={{color: 'var(--neon-cyan)'}}>{status.toUpperCase()}</span>
          <span className="summary-label">Estado del Gateway</span>
        </div>
        <div className="glass-card summary-item">
          <Server size={24} color="var(--neon-purple)" style={{marginBottom: '8px'}} />
          <span className="summary-value" style={{color: 'var(--neon-purple)'}}>{activeNodes} / {nodes.length}</span>
          <span className="summary-label">Nodos Activos</span>
        </div>
        <div className="glass-card summary-item">
          <Zap size={24} color="var(--neon-green)" style={{marginBottom: '8px'}} />
          <span className="summary-value" style={{color: 'var(--neon-green)'}}>99.9%</span>
          <span className="summary-label">Uptime Global</span>
        </div>
      </div>

      <div className="network-grid">
        {nodes.map(node => (
          <div key={node.id} className="glass-card node-card">
            <div className="node-header">
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span className={`pulse-dot ${getPulseClass(node.status)}`}></span>
                <span className="node-name">{node.region.toUpperCase()}</span>
              </div>
              <span className={`node-status-badge ${getStatusClass(node.status)}`}>
                {node.status}
              </span>
            </div>
            
            <div className="node-details">
              <div className="detail-row">
                <span className="detail-label">ID del Nodo</span>
                <span className="detail-value">{node.id}</span>
              </div>
              
              <div className="detail-group">
                <div className="detail-row">
                  <span className="detail-label"><Wifi size={14} style={{marginRight: '6px'}}/>Latencia</span>
                  <span className="detail-value">{node.latency.toFixed(0)}ms</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{
                      width: `${Math.min(100, (node.latency / 200) * 100)}%`, 
                      background: getBarColor(node.latency, 'latency')
                    }}
                  ></div>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-row">
                  <span className="detail-label"><Cpu size={14} style={{marginRight: '6px'}}/>Carga</span>
                  <span className="detail-value">{node.load.toFixed(0)}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{
                      width: `${node.load}%`, 
                      background: getBarColor(node.load, 'load')
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkMonitor;
