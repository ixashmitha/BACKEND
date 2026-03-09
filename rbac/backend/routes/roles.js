const express = require('express');
const router = express.Router();
const { getRoles, createRole, deleteRole } = require('../controllers/rolesController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.get('/',      verifyToken, checkPermission('RoleManagement', 'read'),   getRoles);
router.post('/',     verifyToken, checkPermission('RoleManagement', 'create'), createRole);
router.delete('/:id',verifyToken, checkPermission('RoleManagement', 'delete'), deleteRole);

module.exports = router;
