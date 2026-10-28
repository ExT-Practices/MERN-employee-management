const express = require('express');
const { callProcedure } = require('../../shared/db');
const { comparePassword, signToken } = require('../../shared/auth');
const { getGoogleClientId, googleLoginForEmployee } = require('../../shared/googleAuth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login as Employee
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: employee1 }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200:
 *         description: Login success with JWT
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Role not allowed on this portal
 */
router.get('/google-client', (req, res) => {
  res.json({ success: true, clientId: getGoogleClientId() });
});

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Google (Employee)
 *     security: []
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential required' });
    }
    const result = await googleLoginForEmployee(credential);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

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
    if (user.role !== 'Employee') {
      return res.status(403).json({
        success: false,
        message: 'This portal is for Employee only. Use Admin portal (port 5001).',
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

module.exports = router;
