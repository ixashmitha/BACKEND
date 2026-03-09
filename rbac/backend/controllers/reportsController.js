const { getPool, sql } = require('../config/db');

const auditLog = async (pool, userId, action, entityId, details) => {
  try {
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('action', sql.NVarChar, action)
      .input('entity_name', sql.NVarChar, 'Reports')
      .input('entity_id', sql.Int, entityId)
      .input('details', sql.NVarChar, details || null)
      .query('INSERT INTO AuditLogs (user_id, action, entity_name, entity_id, details) VALUES (@user_id, @action, @entity_name, @entity_id, @details)');
  } catch (e) { /* non-blocking */ }
};

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT r.id, r.title, r.description, r.report_type, r.created_at, r.updated_at,
             u.name as created_by_name
      FROM Reports r
      LEFT JOIN Users u ON r.created_by = u.id
      WHERE r.is_deleted = 0
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
  }
};

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, description, report_type } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || null)
      .input('report_type', sql.NVarChar, report_type || 'General')
      .input('created_by', sql.Int, req.user.id)
      .query(`
        INSERT INTO Reports (title, description, report_type, created_by)
        OUTPUT INSERTED.id
        VALUES (@title, @description, @report_type, @created_by)
      `);

    const newId = result.recordset[0].id;
    await auditLog(pool, req.user.id, 'CREATE_REPORT', newId, `Created report: ${title}`);

    res.status(201).json({ success: true, message: 'Report created successfully.', id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create report.' });
  }
};

// PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, report_type } = req.body;

    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || null)
      .input('report_type', sql.NVarChar, report_type || 'General')
      .query(`
        UPDATE Reports
        SET title = @title, description = @description, report_type = @report_type, updated_at = GETDATE()
        WHERE id = @id AND is_deleted = 0
      `);

    await auditLog(pool, req.user.id, 'UPDATE_REPORT', parseInt(id), `Updated report: ${title}`);
    res.json({ success: true, message: 'Report updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update report.' });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Reports SET is_deleted = 1, updated_at = GETDATE() WHERE id = @id');

    await auditLog(pool, req.user.id, 'DELETE_REPORT', parseInt(id), `Deleted report ID: ${id}`);
    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete report.' });
  }
};

module.exports = { getReports, createReport, updateReport, deleteReport };
