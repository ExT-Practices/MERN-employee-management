const express = require('express');
const { callProcedure, callProcedureWithOut } = require('../../shared/db');
const {
  comparePassword,
  signToken,
  hashPassword,
  authMiddleware,
} = require('../../shared/auth');
const { getGoogleClientId, googleLoginForAdmin } = require('../../shared/googleAuth');

const router = express.Router();

router.get('/google-client', (req, res) => {
  res.json({ success: true, clientId: getGoogleClientId() });
});

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Google (Admin)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential: { type: string }
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential required' });
    }
    const result = await googleLoginForAdmin(credential);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login as Admin only (HR & Manager live under Admin dashboard)
 *     security: []
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password required' });
    }

    const rows = await callProcedure('sp_get_user_by_username', [username]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message:
          user.role === 'Employee'
            ? 'Use Employee frontend (port 5002).'
            : 'Only Admin can login here. HR and Manager roles are inside Admin dashboard.',
      });
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username: { type: string, example: newhr }
 *               password: { type: string, example: password123 }
 *               role: { type: string, enum: [Admin, HR, Manager, Employee] }
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', authMiddleware(['Admin']), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee'];

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'username, password and role are required',
      });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${allowedRoles.join(', ')}`,
      });
    }

    const existing = await callProcedure('sp_get_user_by_username', [username]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const hashed = await hashPassword(password);
    const out = await callProcedureWithOut('sp_create_user', [username, hashed, role], 1);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: out.out0, username, role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
