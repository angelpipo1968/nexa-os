const express = require('express');
const { createHandler } = require('@expo/server');

const app = express();
const port = process.env.PORT || 3000;

app.use('/api', createHandler({
  // Configuración para actualizaciones OTA
  mode: 'production',
  projectRoot: __dirname,
  cacheDuration: 0
}));

app.listen(port, () => {
  console.log(`Servidor de NexaAI corriendo en http://localhost:${port}`);
});
