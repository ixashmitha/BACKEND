const { getPool, sql } = require('../config/db');

// GET /api/roles
const getRoles = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, role_name, created_at FROM Roles WHERE is_deleted = 0 ORDER BY id
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch roles.' });
  }
};

// POST /api/roles
const createRole = async (req, res) => {
  try {
    const { role_name } = req.body;

    if (!role_name || !role_name.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required.' });
    }

    const pool = await getPool();

    const exists = await pool.request()
      .input('role_name', sql.NVarChar, role_name.trim())
      .query('SELECT id FROM Roles WHERE role_name = @role_name AND is_deleted = 0');

    if (exists.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Role name already exists.' });
    }

    const result = await pool.request()
      .input('role_name', sql.NVarChar, role_name.trim())
      .query('INSERT INTO Roles (role_name) OUTPUT INSERTED.id VALUES (@role_name)');

    const newId = result.recordset[0].id;

    // Auto-create permission rows for new role (all false by default)
    const modules = await pool.request().query('SELECT id FROM Modules');
    for (const mod of modules.recordset) {
      await pool.request()
        .input('role_id', sql.Int, newId)
        .input('module_id', sql.Int, mod.id)
        .query('INSERT INTO Permissions (role_id, module_id) VALUES (@role_id, @module_id)');
    }

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('action', sql.NVarChar, 'CREATE_ROLE')
      .input('entity_name', sql.NVarChar, 'Roles')
      .input('entity_id', sql.Int, newId)
      .query('INSERT INTO AuditLogs (user_id, action, entity_name, entity_id) VALUES (@user_id, @action, @entity_name, @entity_id)');

    res.status(201).json({ success: true, message: 'Role created successfully.', id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create role.' });
  }
};

// DELETE /api/roles/:id
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Protect system roles
    if ([1, 2, 3, 4].includes(parseInt(id))) {
      return res.status(400).json({ success: false, message: 'Cannot delete system default roles.' });
    }

    const pool = await getPool();

    // Check if any users assigned to this role
    const users = await pool.request()
      .input('role_id', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM Users WHERE role_id = @role_id AND is_deleted = 0');

    if (users.recordset[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete role with assigned users.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Roles SET is_deleted = 1 WHERE id = @id');

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('action', sql.NVarChar, 'DELETE_ROLE')
      .input('entity_name', sql.NVarChar, 'Roles')
      .input('entity_id', sql.Int, parseInt(id))
      .query('INSERT INTO AuditLogs (user_id, action, entity_name, entity_id) VALUES (@user_id, @action, @entity_name, @entity_id)');

    res.json({ success: true, message: 'Role deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete role.' });
  }
};

module.exports = { getRoles, createRole, deleteRole };
