const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const geoip = require('geoip-lite');
const { CassandraClient } = require('./db/cassandra'); // Mock import

const app = express();
const PORT = process.env.PORT || 8080;

// Balanceador de carga geolocalizado
const nodes = {
  'NA': 'https://na-nexa-gateway-1.azurewebsites.net',
  'EU': 'https://eu-nexa-gateway-2.aws.com',
  'ASIA': 'https://asia-nexa-gateway-3.gcp.cloud'
};

// Middleware para determinar región
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const geo = geoip.lookup(ip);
  const region = geo?.country ? mapCountryToRegion(geo.country) : 'NA'; // Default to NA
  req.region = region in nodes ? region : 'NA';
  console.log(`[Gateway] Request from IP: ${ip}, Region: ${req.region}`);
  next();
});

function mapCountryToRegion(countryCode) {
    // Simple mock mapping
    const euCountries = ['GB', 'DE', 'FR', 'ES', 'IT'];
    const asiaCountries = ['CN', 'JP', 'IN', 'KR'];
    if (euCountries.includes(countryCode)) return 'EU';
    if (asiaCountries.includes(countryCode)) return 'ASIA';
    return 'NA';
}

// Enrutamiento inteligente
app.use('/api/:service', (req, res, next) => {
  const target = nodes[req.region];
  console.log(`[Proxy] Routing to ${target}`);
  createProxyMiddleware({ 
      target: target,
      changeOrigin: true,
      pathRewrite: {
          '^/api': ''
      }
  })(req, res, next);
});

// Mock Cassandra connection (Placeholder)
const cassandra = new CassandraClient({
  contactPoints: ['cassandra-us-east', 'cassandra-eu-west'],
  localDataCenter: 'us-east' 
});

app.listen(PORT, () => {
  console.log(`Global Gateway running on port ${PORT}`);
});
