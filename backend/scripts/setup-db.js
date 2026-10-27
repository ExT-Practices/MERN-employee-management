const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection(config);

  const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  const procedures = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'stored_procedures.sql'),
    'utf8'
  );

  console.log('Creating schema...');
  await connection.query(schema);

  console.log('Creating stored procedures...');
  await executeProcedureFile(connection, procedures);

  const [procs] = await connection.query(
    "SHOW PROCEDURE STATUS WHERE Db = 'employee_management'"
  );
  console.log(
    'Procedures:',
    procs.map((p) => p.Name).join(', ') || '(none)'
  );

  await connection.end();
  console.log('Database setup complete.');
  console.log('Next: npm run seed');
}

async function executeProcedureFile(connection, sql) {
  await connection.query('USE employee_management');

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
    try {
      await connection.query(stmt);
    } catch (err) {
      console.error('Failed statement:', stmt.slice(0, 80).replace(/\s+/g, ' '));
      throw err;
    }
  }
}

run().catch((err) => {
  console.error('Setup failed:', err.message);
  console.error('\nCheck .env DB_PASSWORD and that MySQL is running.');
  process.exit(1);
});
