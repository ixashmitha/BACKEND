const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');

/**
 * Middleware: Verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * Middleware: Check permission for module + action
 * @param {string} moduleName - Module name (e.g., 'Users')
 * @param {string} action - 'create' | 'read' | 'update' | 'delete'
 */
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const pool = await getPool();

      const result = await pool.request()
        .input('role_id', sql.Int, req.user.role_id)
        .input('module_name', sql.NVarChar, moduleName)
        .query(`
          SELECT p.can_create, p.can_read, p.can_update, p.can_delete
          FROM Permissions p
          JOIN Modules m ON p.module_id = m.id
          WHERE p.role_id = @role_id
            AND m.module_name = @module_name
            AND p.is_deleted = 0
        `);

      if (result.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          message: `Access denied. No permissions found for module: ${moduleName}`
        });
      }

      const perm = result.recordset[0];
      const actionMap = {
        create: perm.can_create,
        read:   perm.can_read,
        update: perm.can_update,
        delete: perm.can_delete
      };

      if (!actionMap[action]) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have ${action} permission for ${moduleName}.`
        });
      }

      // Store permissions on request for potential use downstream
      req.permissions = perm;
      next();
    } catch (err) {
      console.error('Permission check error:', err.message);
      res.status(500).json({ success: false, message: 'Permission check failed.' });
    }
  };
};

module.exports = { verifyToken, checkPermission };
