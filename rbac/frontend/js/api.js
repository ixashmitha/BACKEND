// ── API Configuration ───────────────────────────────────────
const API_BASE = window.location.origin + '/api';

// ── Toast Notification System ───────────────────────────────
function initToasts() {
  if (!document.querySelector('.toast-container')) {
    const el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
}

function showToast(title, message, type = 'info', duration = 3500) {
  initToasts();
  const container = document.querySelector('.toast-container');

  const icons = {
    success: `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error:   `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    info:    `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Loading Overlay ─────────────────────────────────────────
function showLoading(msg = 'Loading...') {
  const existing = document.querySelector('.loading-overlay');
  if (existing) return;
  const el = document.createElement('div');
  el.className = 'loading-overlay';
  el.innerHTML = `<div class="loading-box"><div class="spinner"></div><span style="font-size:0.85rem;color:var(--text-secondary)">${msg}</span></div>`;
  document.body.appendChild(el);
}

function hideLoading() {
  const el = document.querySelector('.loading-overlay');
  if (el) el.remove();
}

// ── HTTP Client ─────────────────────────────────────────────
async function apiRequest(method, endpoint, data = null, showLoad = false) {
  const token = localStorage.getItem('rbac_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (showLoad) showLoading();

  try {
    const opts = { method, headers };
    if (data && method !== 'GET') opts.body = JSON.stringify(data);

    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const json = await res.json();

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/login.html';
      return null;
    }

    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    console.error('API error:', err);
    showToast('Network Error', 'Could not connect to server.', 'error');
    return { ok: false, data: { message: 'Network error' } };
  } finally {
    if (showLoad) hideLoading();
  }
}

const api = {
  get:    (url)       => apiRequest('GET', url),
  post:   (url, data) => apiRequest('POST', url, data, true),
  put:    (url, data) => apiRequest('PUT', url, data, true),
  delete: (url)       => apiRequest('DELETE', url, null, true),
};

// ── Modal Helpers ───────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

function confirmAction(message) {
  return new Promise(resolve => {
    if (window.confirm(message)) resolve(true);
    else resolve(false);
  });
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ── Format Helpers ──────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

function getRoleChip(roleName) {
  const map = {
    'SuperAdmin': 'chip-amber',
    'Admin':      'chip-blue',
    'Manager':    'chip-green',
    'Employee':   'chip-gray',
  };
  return `<span class="chip ${map[roleName] || 'chip-gray'}">${roleName}</span>`;
}

function getInitials(name) {
  return (name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
