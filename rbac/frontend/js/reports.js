// reports.js
let allReports = [];
let canCreate = false, canUpdate = false, canDelete = false;

const user = requireAuth();
if (user) {
  document.getElementById('roleLabel').textContent = user.role_name;
  loadSidebar('Reports');
  initReports();
}

async function initReports() {
  // Load permissions
  const permRes = await api.get('/permissions/module-permissions/Reports');
  if (permRes?.ok) {
    const p = permRes.data.data;
    canCreate = p.can_create;
    canUpdate = p.can_update;
    canDelete = p.can_delete;
    if (canCreate) document.getElementById('addReportBtn').style.display = 'inline-flex';
  }
  await loadReports();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderReports(allReports.filter(r =>
      r.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
      (r.report_type || '').toLowerCase().includes(e.target.value.toLowerCase())
    ));
  });
}

async function loadReports() {
  const res = await api.get('/reports');
  if (!res?.ok) {
    showToast('Error', res?.data?.message || 'Failed to load reports.', 'error');
    return;
  }
  allReports = res.data.data || [];
  renderReports(allReports);
}

function renderReports(reports) {
  const tbody = document.getElementById('reportsTableBody');

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="data-empty">
      <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      <p>No reports found.</p>
    </td></tr>`;
    return;
  }

  const typeColors = { Financial:'chip-green', Analytics:'chip-blue', Audit:'chip-amber', Performance:'chip-purple', General:'chip-gray' };

  tbody.innerHTML = reports.map((r, i) => `
    <tr>
      <td style="color:var(--text-muted)">${i + 1}</td>
      <td style="font-weight:500">${r.title}</td>
      <td><span class="chip ${typeColors[r.report_type] || 'chip-gray'}">${r.report_type || 'General'}</span></td>
      <td style="color:var(--text-secondary);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.description || '—'}</td>
      <td>${r.created_by_name || '—'}</td>
      <td style="color:var(--text-secondary)">${formatDate(r.created_at)}</td>
      <td>
        <div class="table-actions">
          ${canUpdate ? `<button class="btn btn-warning btn-sm" onclick="openEditModal(${r.id})">Edit</button>` : ''}
          ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="deleteReport(${r.id})">Delete</button>` : ''}
          ${!canUpdate && !canDelete ? '<span style="color:var(--text-muted);font-size:0.78rem">View only</span>' : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('reportId').value   = '';
  document.getElementById('reportTitle').value = '';
  document.getElementById('reportType').value  = 'General';
  document.getElementById('reportDesc').value  = '';
  document.getElementById('modalTitle').textContent = 'Add Report';
  openModal('reportModal');
}

function openEditModal(id) {
  const r = allReports.find(x => x.id === id);
  if (!r) return;
  document.getElementById('reportId').value    = r.id;
  document.getElementById('reportTitle').value = r.title;
  document.getElementById('reportType').value  = r.report_type || 'General';
  document.getElementById('reportDesc').value  = r.description || '';
  document.getElementById('modalTitle').textContent = 'Edit Report';
  openModal('reportModal');
}

async function saveReport() {
  const id    = document.getElementById('reportId').value;
  const title = document.getElementById('reportTitle').value.trim();
  const type  = document.getElementById('reportType').value;
  const desc  = document.getElementById('reportDesc').value.trim();

  if (!title) { showToast('Validation', 'Title is required.', 'error'); return; }

  const btn = document.getElementById('saveReportBtn');
  btn.disabled = true;

  const payload = { title, report_type: type, description: desc };
  const res = id
    ? await api.put(`/reports/${id}`, payload)
    : await api.post('/reports', payload);

  btn.disabled = false;

  if (res?.ok) {
    showToast('Success', id ? 'Report updated.' : 'Report created.', 'success');
    closeModal('reportModal');
    await loadReports();
  } else {
    showToast('Error', res?.data?.message || 'Operation failed.', 'error');
  }
}

async function deleteReport(id) {
  const ok = await confirmAction('Are you sure you want to delete this report?');
  if (!ok) return;
  const res = await api.delete(`/reports/${id}`);
  if (res?.ok) {
    showToast('Deleted', 'Report removed.', 'success');
    await loadReports();
  } else {
    showToast('Error', res?.data?.message || 'Delete failed.', 'error');
  }
}
