const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee API',
      version: '1.0.0',
      description: 'Port 5002 — Employee frontend API',
    },
    servers: [{ url: 'http://localhost:5002', description: 'Employee frontend' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './backend/employee-server/routes/*.js',
    './backend/employee-server/server.js',
  ],
};

module.exports = swaggerJsdoc(options);
