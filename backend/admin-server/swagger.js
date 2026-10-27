const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin / HR / Manager API',
      version: '1.0.0',
      description:
        'Port 5001 — Admin (Add/Update/Delete/Register), HR (Add/Update), Manager (View)',
    },
    servers: [{ url: 'http://localhost:5001', description: 'Admin portal' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './backend/admin-server/routes/*.js',
    './backend/admin-server/server.js',
  ],
};

module.exports = swaggerJsdoc(options);
