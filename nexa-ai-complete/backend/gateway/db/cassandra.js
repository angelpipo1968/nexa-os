// Mock Cassandra Client
class CassandraClient {
    constructor(config) {
        this.config = config;
        console.log('Initializing Cassandra Client with config:', config);
    }

    async execute(query, params) {
        console.log('Executing CQL:', query, params);
        return { rows: [] };
    }
}

module.exports = { CassandraClient };
