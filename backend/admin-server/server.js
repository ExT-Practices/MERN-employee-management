const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = Number(process.env.ADMIN_PORT) || 5001;
const publicDir = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({
    portal: 'Admin / HR / Manager',
    port: PORT,
    ui: `http://localhost:${PORT}`,
    swagger: `http://localhost:${PORT}/api-docs`,
    roles: {
      login: 'Admin only',
      underAdmin: {
        Admin: ['Add', 'Update', 'Delete', 'Register'],
        HR: ['Add', 'Update'],
        Manager: ['View'],
      },
    },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Admin portal (Admin/HR/Manager): http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
