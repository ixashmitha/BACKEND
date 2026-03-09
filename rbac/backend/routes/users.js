const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/usersController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.get('/',     verifyToken, checkPermission('Users', 'read'),   getUsers);
router.post('/',    verifyToken, checkPermission('Users', 'create'), createUser);
router.put('/:id',  verifyToken, checkPermission('Users', 'update'), updateUser);
router.delete('/:id', verifyToken, checkPermission('Users', 'delete'), deleteUser);

module.exports = router;
