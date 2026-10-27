const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    const [rows] = await conn.query('SELECT VERSION() AS version');
    console.log('MySQL connected. Version:', rows[0].version);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    console.error('Update DB_PASSWORD in .env file, then run: npm run setup && npm run seed');
    process.exit(1);
  }
})();
