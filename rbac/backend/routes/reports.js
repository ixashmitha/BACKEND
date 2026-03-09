const express = require('express');
const router = express.Router();
const { getReports, createReport, updateReport, deleteReport } = require('../controllers/reportsController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.get('/',      verifyToken, checkPermission('Reports', 'read'),   getReports);
router.post('/',     verifyToken, checkPermission('Reports', 'create'), createReport);
router.put('/:id',   verifyToken, checkPermission('Reports', 'update'), updateReport);
router.delete('/:id',verifyToken, checkPermission('Reports', 'delete'), deleteReport);

module.exports = router;
