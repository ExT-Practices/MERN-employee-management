const express = require('express');
const { callProcedure } = require('../../shared/db');
const { authMiddleware } = require('../../shared/auth');

const router = express.Router();

/**
 * @swagger
 * /api/employees/me:
 *   get:
 *     tags: [Employees]
 *     summary: View own profile (Employee)
 *     responses:
 *       200:
 *         description: Logged-in employee profile
 */
router.get('/me', authMiddleware(['Employee']), async (req, res) => {
  try {
    const rows = await callProcedure('sp_get_employee_by_user_id', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to this user',
      });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: View all employees (Employee)
 *     responses:
 *       200:
 *         description: List of all employees
 */
router.get('/', authMiddleware(['Employee']), async (req, res) => {
  try {
    const rows = await callProcedure('sp_get_all_employees');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: View employee by ID (Employee)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employee details
 */
router.get('/:id', authMiddleware(['Employee']), async (req, res) => {
  try {
    const rows = await callProcedure('sp_get_employee_by_id', [Number(req.params.id)]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete employee (Employee)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete('/:id', authMiddleware(['Employee']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await callProcedure('sp_get_employee_by_id', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    await callProcedure('sp_delete_employee', [id]);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
