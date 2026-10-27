const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_management',
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { username: 'admin', role: 'Admin' },
    { username: 'hr', role: 'HR' },
    { username: 'manager', role: 'Manager' },
    { username: 'employee1', role: 'Employee' },
    { username: 'employee2', role: 'Employee' },
  ];

  console.log('Seeding users...');
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
      [u.username, passwordHash, u.role]
    );
  }

  const [emp1Rows] = await pool.query(`SELECT id FROM users WHERE username = 'employee1'`);
  const [emp2Rows] = await pool.query(`SELECT id FROM users WHERE username = 'employee2'`);
  const emp1UserId = emp1Rows[0].id;
  const emp2UserId = emp2Rows[0].id;

  console.log('Seeding employees...');
  await pool.query(`DELETE FROM employees`);

  await pool.query(
    `CALL sp_add_employee(?, 'EMP001', 'Rahul', 'Sharma', 'rahul@company.com', '9876543210',
      'IT', 'Software Developer', 55000, '2024-01-15', @eid)`,
    [emp1UserId]
  );
  await pool.query(
    `CALL sp_add_employee(?, 'EMP002', 'Priya', 'Patel', 'priya@company.com', '9876543211',
      'HR', 'HR Executive', 45000, '2024-03-01', @eid)`,
    [emp2UserId]
  );
  await pool.query(
    `CALL sp_add_employee(NULL, 'EMP003', 'Amit', 'Kumar', 'amit@company.com', '9876543212',
      'Sales', 'Sales Executive', 40000, '2024-06-10', @eid)`
  );

  await pool.end();
  console.log('Seed complete.');
  console.log('');
  console.log('Login credentials (password for all: password123)');
  console.log('  admin      -> Admin');
  console.log('  hr         -> HR');
  console.log('  manager    -> Manager');
  console.log('  employee1  -> Employee');
  console.log('  employee2  -> Employee');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
