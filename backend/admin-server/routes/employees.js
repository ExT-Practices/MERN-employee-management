const express = require('express');
const { callProcedure, callProcedureWithOut } = require('../../shared/db');
const { authMiddleware, hashPassword } = require('../../shared/auth');

const router = express.Router();

/**
 * @swagger
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: View all employees (Admin, HR, Manager)
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get('/', authMiddleware(['Admin', 'HR', 'Manager']), async (req, res) => {
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
 *     summary: View employee by ID (Admin, HR, Manager)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employee details
 */
router.get('/:id', authMiddleware(['Admin', 'HR', 'Manager']), async (req, res) => {
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
 * /api/employees:
 *   post:
 *     tags: [Employees]
 *     summary: Add employee (Admin, HR)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emp_code, first_name, last_name, email]
 *             properties:
 *               emp_code: { type: string, example: EMP004 }
 *               first_name: { type: string, example: Sneha }
 *               last_name: { type: string, example: Gupta }
 *               email: { type: string, example: sneha@company.com }
 *               phone: { type: string, example: "9876543213" }
 *               department: { type: string, example: Finance }
 *               designation: { type: string, example: Accountant }
 *               salary: { type: number, example: 42000 }
 *               date_of_joining: { type: string, example: "2025-01-10" }
 *               create_login: { type: boolean, example: true }
 *               username: { type: string, example: sneha }
 *               password: { type: string, example: password123 }
 *     responses:
 *       201:
 *         description: Employee created
 */
router.post('/', authMiddleware(['Admin', 'HR']), async (req, res) => {
  try {
    const {
      emp_code,
      first_name,
      last_name,
      email,
      phone,
      department,
      designation,
      salary,
      date_of_joining,
      create_login,
      username,
      password,
    } = req.body;

    if (!emp_code || !first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'emp_code, first_name, last_name, email are required',
      });
    }

    let userId = null;
    if (create_login) {
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'username and password required when create_login is true',
        });
      }
      const hashed = await hashPassword(password);
      const out = await callProcedureWithOut(
        'sp_create_user',
        [username, hashed, 'Employee'],
        1
      );
      userId = out.out0;
    }

    const out = await callProcedureWithOut(
      'sp_add_employee',
      [
        userId,
        emp_code,
        first_name,
        last_name,
        email,
        phone || null,
        department || null,
        designation || null,
        salary || 0,
        date_of_joining || null,
      ],
      1
    );

    const rows = await callProcedure('sp_get_employee_by_id', [out.out0]);
    res.status(201).json({ success: true, message: 'Employee added', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Update employee (Admin, HR)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               department: { type: string }
 *               designation: { type: string }
 *               salary: { type: number }
 *               date_of_joining: { type: string }
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.put('/:id', authMiddleware(['Admin', 'HR']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await callProcedure('sp_get_employee_by_id', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const e = existing[0];
    const {
      first_name = e.first_name,
      last_name = e.last_name,
      email = e.email,
      phone = e.phone,
      department = e.department,
      designation = e.designation,
      salary = e.salary,
      date_of_joining = e.date_of_joining,
      status = e.status,
    } = req.body;

    await callProcedure('sp_update_employee', [
      id,
      first_name,
      last_name,
      email,
      phone,
      department,
      designation,
      salary,
      date_of_joining,
      status,
    ]);

    const rows = await callProcedure('sp_get_employee_by_id', [id]);
    res.json({ success: true, message: 'Employee updated', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete employee (Admin, HR)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete('/:id', authMiddleware(['Admin', 'HR']), async (req, res) => {
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
