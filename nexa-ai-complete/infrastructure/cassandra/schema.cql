-- Keyspace definition for Multi-Region Replication
CREATE KEYSPACE IF NOT EXISTS nexa WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'us-east': 3,
  'eu-west': 2,
  'ap-southeast': 2
};

USE nexa;

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  user_id uuid PRIMARY KEY,
  session_token text,
  last_active timestamp,
  device_fingerprints set<text>,
  encryption_key blob
) WITH compaction = {'class': 'LeveledCompactionStrategy'};

-- Access Logs for GDPR Compliance
-- Note: 'GENERATED ALWAYS AS' requires UDFs or client-side logic in standard Cassandra. 
-- Included here as per architecture spec.
CREATE TABLE IF NOT EXISTS access_logs (
  log_id uuid PRIMARY KEY,
  user_id uuid,
  action_type text,
  timestamp timestamp,
  ip_address inet,
  country_code text 
) WITH default_time_to_live = 15552000; -- 180 days retention for GDPR

-- Index for querying logs by user
CREATE INDEX IF NOT EXISTS ON access_logs (user_id);
