
// NEXA AI - Database Service (Cassandra/ScyllaDB Simulation)
import { v4 as uuidv4 } from 'uuid';

class DatabaseService {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.subscribers = new Set();
    
    // Initial mock data
    this.insertLog('system', 'INIT_CLUSTER', '192.168.1.1');
  }

  // Simulates: country_code(ip_address) STORED
  getCountryFromIP(ip) {
    const octet = parseInt(ip.split('.')[0]);
    if (octet < 50) return 'US';
    if (octet < 100) return 'EU';
    if (octet < 150) return 'JP';
    if (octet < 200) return 'BR';
    return 'UN';
  }

  // Simulates: INSERT INTO access_logs ...
  insertLog(userId, actionType, ipAddress) {
    const log = {
      log_id: uuidv4(),
      user_id: userId || uuidv4(),
      action_type: actionType,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress || this.generateRandomIP(),
      country_code: this.getCountryFromIP(ipAddress || '192.168.1.1')
    };

    this.logs.unshift(log);
    
    // Simulate TTL cleanup (keeping array size manageable for UI)
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notifySubscribers();
    return log;
  }

  generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  getLogs() {
    return this.logs;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.logs));
  }
}

export const database = new DatabaseService();
export default DatabaseService;
