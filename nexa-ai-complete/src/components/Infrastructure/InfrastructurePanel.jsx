import React, { useState, useEffect } from 'react';
import { database } from '../../services/DatabaseService';
import { Database, FileCode, Shield, RefreshCw, FileText } from 'lucide-react';

const InfrastructurePanel = () => {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('schema'); // schema, logs, terraform
  const [activeFile, setActiveFile] = useState('main.tf');

  useEffect(() => {
    setLogs(database.getLogs());
    const unsubscribe = database.subscribe(setLogs);
    
    // Simulate incoming traffic
    const interval = setInterval(() => {
      const actions = ['LOGIN_ATTEMPT', 'VIEW_MODULE', 'GENERATE_LOGO', 'API_REQUEST', 'SYNC_DATA'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      database.insertLog(null, action);
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const cqlSchema = `-- Tabla de registros de acceso 
CREATE TABLE access_logs ( 
  log_id uuid PRIMARY KEY, 
  user_id uuid, 
  action_type text, 
  timestamp timestamp, 
  ip_address inet, 
  country_code text GENERATED ALWAYS AS (country_code(ip_address)) STORED 
) WITH default_time_to_live = 15552000; -- 180 días`;

  const files = {
    'main.tf': `resource "cassandra_table" "access_logs" {
  keyspace_name = "nexa_system"
  table_name    = "access_logs"

  column {
    name = "log_id"
    type = "uuid"
  }
  column {
    name = "user_id"
    type = "uuid"
  }
  column {
    name = "action_type"
    type = "text"
  }
  column {
    name = "timestamp"
    type = "timestamp"
  }
  column {
    name = "ip_address"
    type = "inet"
  }
  
  partition_key = ["log_id"]
  
  options {
    default_time_to_live = 15552000
  }
}`,
    'global.tfvars': `region_list = ["us-east-1", "eu-central-1", "ap-northeast-1"] 
instance_type = "t3.medium" 
cassandra_replication = 3`,
    'docker-compose.global.yml': `# docker-compose.global.yml 
services: 
  chat_service: 
    image: nexa/ai-chat:latest 
    deploy: 
      replicas: 6 
      placement: 
        constraints: 
          - node.labels.region==\${DEPLOY_REGION} 
    networks: 
      - nexa-overlay 

networks: 
  nexa-overlay: 
    driver: overlay 
    attachable: true`
  };

  return (
    <div className="module-container">
      <h2><Shield size={24} style={{marginRight: '10px', verticalAlign: 'middle'}}/> Infraestructura & Seguridad</h2>
      
      <div className="infra-tabs">
        <button className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`} onClick={() => setActiveTab('schema')}>
          <Database size={16} /> Schema (CQL)
        </button>
        <button className={`tab-btn ${activeTab === 'terraform' ? 'active' : ''}`} onClick={() => setActiveTab('terraform')}>
          <FileCode size={16} /> Infra as Code
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <RefreshCw size={16} /> Live Logs
        </button>
      </div>

      <div className="infra-content">
        {activeTab === 'schema' && (
          <div className="code-block-container">
            <div className="code-header">schema.cql</div>
            <pre className="code-block">
              <code>{cqlSchema}</code>
            </pre>
          </div>
        )}

        {activeTab === 'terraform' && (
          <div className="iac-container">
            <div className="file-sidebar">
              {Object.keys(files).map(fileName => (
                <button 
                  key={fileName}
                  className={`file-btn ${activeFile === fileName ? 'active' : ''}`}
                  onClick={() => setActiveFile(fileName)}
                >
                  <FileText size={14} /> {fileName}
                </button>
              ))}
            </div>
            <div className="code-block-container" style={{flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}>
              <div className="code-header">{activeFile}</div>
              <pre className="code-block">
                <code>{files[activeFile]}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-container">
             <div className="logs-header">
               <span>TIMESTAMP</span>
               <span>ACTION</span>
               <span>IP ADDRESS</span>
               <span>REGION</span>
               <span>ID</span>
             </div>
             <div className="logs-list">
               {logs.map(log => (
                 <div key={log.log_id} className="log-row">
                   <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                   <span className="log-action">{log.action_type}</span>
                   <span className="log-ip">{log.ip_address}</span>
                   <span className="log-region"><span className="flag-badge">{log.country_code}</span></span>
                   <span className="log-id">{log.log_id.substring(0, 8)}...</span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfrastructurePanel;
