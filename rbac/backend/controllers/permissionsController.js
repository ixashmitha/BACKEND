const { getPool, sql } = require('../config/db');

// GET /api/permissions/:roleId
const getPermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('role_id', sql.Int, roleId)
      .query(`
        SELECT p.id, p.role_id, p.module_id, m.module_name, m.description, m.display_order,
               p.can_create, p.can_read, p.can_update, p.can_delete
        FROM Permissions p
        JOIN Modules m ON p.module_id = m.id
        WHERE p.role_id = @role_id AND p.is_deleted = 0
        ORDER BY m.display_order
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch permissions.' });
  }
};

// PUT /api/permissions/:roleId
const updatePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body; // Array of { module_id, can_create, can_read, can_update, can_delete }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'Permissions array is required.' });
    }

    const pool = await getPool();

    for (const perm of permissions) {
      const { module_id, can_create, can_read, can_update, can_delete } = perm;

      // Check if permission row exists
      const exists = await pool.request()
        .input('role_id', sql.Int, roleId)
        .input('module_id', sql.Int, module_id)
        .query('SELECT id FROM Permissions WHERE role_id = @role_id AND module_id = @module_id');

      if (exists.recordset.length > 0) {
        await pool.request()
          .input('role_id', sql.Int, roleId)
          .input('module_id', sql.Int, module_id)
          .input('can_create', sql.Bit, can_create ? 1 : 0)
          .input('can_read', sql.Bit, can_read ? 1 : 0)
          .input('can_update', sql.Bit, can_update ? 1 : 0)
          .input('can_delete', sql.Bit, can_delete ? 1 : 0)
          .query(`
            UPDATE Permissions
            SET can_create = @can_create, can_read = @can_read,
                can_update = @can_update, can_delete = @can_delete, is_deleted = 0
            WHERE role_id = @role_id AND module_id = @module_id
          `);
      } else {
        await pool.request()
          .input('role_id', sql.Int, roleId)
          .input('module_id', sql.Int, module_id)
          .input('can_create', sql.Bit, can_create ? 1 : 0)
          .input('can_read', sql.Bit, can_read ? 1 : 0)
          .input('can_update', sql.Bit, can_update ? 1 : 0)
          .input('can_delete', sql.Bit, can_delete ? 1 : 0)
          .query(`
            INSERT INTO Permissions (role_id, module_id, can_create, can_read, can_update, can_delete)
            VALUES (@role_id, @module_id, @can_create, @can_read, @can_update, @can_delete)
          `);
      }
    }

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('action', sql.NVarChar, 'UPDATE_PERMISSIONS')
      .input('entity_name', sql.NVarChar, 'Permissions')
      .input('entity_id', sql.Int, parseInt(roleId))
      .query('INSERT INTO AuditLogs (user_id, action, entity_name, entity_id) VALUES (@user_id, @action, @entity_name, @entity_id)');

    res.json({ success: true, message: 'Permissions updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update permissions.' });
  }
};

// GET /api/module-permissions/:moduleName
const getModulePermissions = async (req, res) => {
  try {
    const { moduleName } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('role_id', sql.Int, req.user.role_id)
      .input('module_name', sql.NVarChar, moduleName)
      .query(`
        SELECT p.can_create, p.can_read, p.can_update, p.can_delete
        FROM Permissions p
        JOIN Modules m ON p.module_id = m.id
        WHERE p.role_id = @role_id AND m.module_name = @module_name AND p.is_deleted = 0
      `);

    if (result.recordset.length === 0) {
      return res.json({ success: true, data: { can_create: false, can_read: false, can_update: false, can_delete: false } });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch module permissions.' });
  }
};

// GET /api/modules - Returns modules user has read access to
const getAccessibleModules = async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('role_id', sql.Int, req.user.role_id)
      .query(`
        SELECT m.id, m.module_name, m.description, m.display_order,
               p.can_create, p.can_read, p.can_update, p.can_delete
        FROM Modules m
        JOIN Permissions p ON m.id = p.module_id
        WHERE p.role_id = @role_id AND p.can_read = 1 AND p.is_deleted = 0
        ORDER BY m.display_order
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch modules.' });
  }
};

module.exports = { getPermissions, updatePermissions, getModulePermissions, getAccessibleModules };
