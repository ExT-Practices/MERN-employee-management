const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function columnExists(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS n
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].n > 0;
}

async function executeProcedureFile(connection, sql) {
  const cleaned = sql
    .replace(/DELIMITER\s+\$\$/gi, '')
    .replace(/DELIMITER\s+;/gi, '')
    .replace(/USE\s+employee_management\s*;/gi, '');

  const statements = cleaned
    .split('$$')
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await connection.query(stmt);
  }
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_management',
    multipleStatements: true,
  });

  if (!(await columnExists(connection, 'users', 'email'))) {
    await connection.query('ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE');
    console.log('Added users.email');
  }
  if (!(await columnExists(connection, 'users', 'google_id'))) {
    await connection.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(64) UNIQUE');
    console.log('Added users.google_id');
  }

  const procedures = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'stored_procedures.sql'),
    'utf8'
  );
  await executeProcedureFile(connection, procedures);
  console.log('Google login migration complete.');
  await connection.end();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
