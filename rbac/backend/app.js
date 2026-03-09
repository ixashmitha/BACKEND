require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api',              require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/reports',      require('./routes/reports'));
app.use('/api/roles',        require('./routes/roles'));
app.use('/api/permissions',  require('./routes/permissions'));

// Also expose module-permissions under /api
app.use('/api',              require('./routes/permissions'));

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RBAC API is running', timestamp: new Date() });
});

// ── Catch-all: Serve frontend ─────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RBAC Server running on http://localhost:${PORT}`);
  console.log(`📋 Frontend: http://localhost:${PORT}/login.html`);
});

module.exports = app;
