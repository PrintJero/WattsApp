const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API WattsApp',
      version: '1.0.0',
      description: 'Documentación de la API de WattsApp (usuarios, dispositivos, mediciones)',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' }
    ]
  },
  apis: [path.join(__dirname, 'routes', '*.js')], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
