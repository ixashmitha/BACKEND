const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

const auditLog = async (pool, userId, action, entityName, entityId, details) => {
  try {
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('action', sql.NVarChar, action)
      .input('entity_name', sql.NVarChar, entityName)
      .input('entity_id', sql.Int, entityId)
      .input('details', sql.NVarChar, details || null)
      .query('INSERT INTO AuditLogs (user_id, action, entity_name, entity_id, details) VALUES (@user_id, @action, @entity_name, @entity_id, @details)');
  } catch (e) { /* non-blocking */ }
};

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT u.id, u.name, u.email, u.role_id, r.role_name, u.created_at, u.updated_at
      FROM Users u
      JOIN Roles r ON u.role_id = r.id
      WHERE u.is_deleted = 0 AND r.is_deleted = 0
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const pool = await getPool();

    // Check duplicate email
    const exists = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email AND is_deleted = 0');

    if (exists.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, hash)
      .input('role_id', sql.Int, role_id)
      .query(`
        INSERT INTO Users (name, email, password_hash, role_id)
        OUTPUT INSERTED.id
        VALUES (@name, @email, @password_hash, @role_id)
      `);

    const newId = result.recordset[0].id;
    await auditLog(pool, req.user.id, 'CREATE_USER', 'Users', newId, `Created user: ${email}`);

    res.status(201).json({ success: true, message: 'User created successfully.', id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role_id, password } = req.body;

    const pool = await getPool();

    let query = `UPDATE Users SET name = @name, email = @email, role_id = @role_id, updated_at = GETDATE()`;
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('role_id', sql.Int, role_id);

    if (password) {
      const hash = await bcrypt.hash(password, 12);
      query += `, password_hash = @password_hash`;
      request.input('password_hash', sql.NVarChar, hash);
    }

    query += ` WHERE id = @id AND is_deleted = 0`;
    await request.query(query);

    await auditLog(pool, req.user.id, 'UPDATE_USER', 'Users', parseInt(id), `Updated user: ${email}`);
    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Users SET is_deleted = 1, updated_at = GETDATE() WHERE id = @id');

    await auditLog(pool, req.user.id, 'DELETE_USER', 'Users', parseInt(id), `Soft-deleted user ID: ${id}`);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
