const express = require('express');
const router = express.Router();
const { getPermissions, updatePermissions, getModulePermissions, getAccessibleModules } = require('../controllers/permissionsController');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Sidebar modules (accessible to all authenticated users)
router.get('/modules', verifyToken, getAccessibleModules);

// Module-level permission check for current user
router.get('/module-permissions/:moduleName', verifyToken, getModulePermissions);

// Role permission management
router.get('/:roleId',  verifyToken, checkPermission('PermissionManagement', 'read'),   getPermissions);
router.put('/:roleId',  verifyToken, checkPermission('PermissionManagement', 'update'), updatePermissions);

module.exports = router;
