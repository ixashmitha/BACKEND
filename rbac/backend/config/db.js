const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'RBACSystem',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(dbConfig);
    console.log('✅ SQL Server connected');
  }
  return pool;
};

module.exports = { getPool, sql };
