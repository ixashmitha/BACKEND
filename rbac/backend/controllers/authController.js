const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');

/**
 * POST /api/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.role_name
        FROM Users u
        JOIN Roles r ON u.role_id = r.id
        WHERE u.email = @email AND u.is_deleted = 0 AND r.is_deleted = 0
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role_id: user.role_id, role_name: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Audit log
    await pool.request()
      .input('user_id', sql.Int, user.id)
      .input('action', sql.NVarChar, 'LOGIN')
      .input('entity_name', sql.NVarChar, 'Users')
      .input('entity_id', sql.Int, user.id)
      .query('INSERT INTO AuditLogs (user_id, action, entity_name, entity_id) VALUES (@user_id, @action, @entity_name, @entity_id)');

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id, role_name: user.role_name }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

module.exports = { login };
