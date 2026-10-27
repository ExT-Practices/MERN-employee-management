const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
});

async function callProcedure(name, params = []) {
  const placeholders = params.map(() => '?').join(', ');
  const sql = placeholders ? `CALL ${name}(${placeholders})` : `CALL ${name}()`;
  const [rows] = await pool.query(sql, params);
  // mysql2 returns [resultSets..., okPacket] for CALL
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

/**
 * Call a stored procedure that has trailing OUT parameters.
 * Returns an object like { out0: value, out1: value }
 */
async function callProcedureWithOut(name, inParams, outCount) {
  const connection = await pool.getConnection();
  try {
    const outVars = Array.from({ length: outCount }, (_, i) => `@out${i}`);
    const args = [...inParams.map(() => '?'), ...outVars].join(', ');
    await connection.query(`CALL ${name}(${args})`, inParams);
    const [outRows] = await connection.query(`SELECT ${outVars.join(', ')}`);
    return outRows[0];
  } finally {
    connection.release();
  }
}

module.exports = { pool, callProcedure, callProcedureWithOut };
