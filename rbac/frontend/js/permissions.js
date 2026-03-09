// permissions.js
let currentRoleId   = null;
let currentPerms    = [];
let canUpdatePerms  = false;

const user = requireAuth();
if (user) {
  document.getElementById('roleLabel').textContent = user.role_name;
  loadSidebar('PermissionManagement');
  initPermissions();
}

async function initPermissions() {
  // Check current user's ability to update permissions
  const permRes = await api.get('/permissions/module-permissions/PermissionManagement');
  if (permRes?.ok) {
    canUpdatePerms = permRes.data.data.can_update;
    if (canUpdatePerms) document.getElementById('savePermBtn').style.display = 'inline-flex';
  }

  // Load roles into dropdown
  const rolesRes = await api.get('/roles');
  if (rolesRes?.ok) {
    const sel = document.getElementById('roleSelect');
    (rolesRes.data.data || []).forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.role_name;
      sel.appendChild(opt);
    });
  }

  // Check URL param for pre-selected role
  const params = new URLSearchParams(window.location.search);
  const preRole = params.get('roleId');
  if (preRole) {
    document.getElementById('roleSelect').value = preRole;
    await onRoleChange();
  }
}

async function onRoleChange() {
  const roleId = document.getElementById('roleSelect').value;
  if (!roleId) {
    document.getElementById('matrixContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    return;
  }

  currentRoleId = roleId;

  const res = await api.get(`/permissions/${roleId}`);
  if (!res?.ok) {
    showToast('Error', 'Failed to load permissions.', 'error');
    return;
  }

  currentPerms = res.data.data || [];

  const roleName = document.getElementById('roleSelect').selectedOptions[0]?.text;
  document.getElementById('selectedRoleInfo').textContent = `Editing permissions for: ${roleName}`;
  document.getElementById('selectedRoleInfo').style.display = 'block';

  renderMatrix();
  document.getElementById('matrixContainer').style.display = 'block';
  document.getElementById('emptyState').style.display = 'none';
}

function renderMatrix() {
  const container = document.getElementById('permissionRows');

  container.innerHTML = currentPerms.map(p => `
    <div class="perm-row" data-module-id="${p.module_id}">
      <div class="perm-module">
        <div>${p.module_name.replace(/([A-Z])/g,' $1').trim()}</div>
        ${p.description ? `<div class="mod-desc">${p.description}</div>` : ''}
      </div>
      <div class="perm-check">
        <div class="checkbox-wrap">
          <input type="checkbox" data-action="create" ${p.can_create ? 'checked' : ''} ${!canUpdatePerms ? 'disabled' : ''}/>
        </div>
      </div>
      <div class="perm-check">
        <div class="checkbox-wrap">
          <input type="checkbox" data-action="read" ${p.can_read ? 'checked' : ''} ${!canUpdatePerms ? 'disabled' : ''}/>
        </div>
      </div>
      <div class="perm-check">
        <div class="checkbox-wrap">
          <input type="checkbox" data-action="update" ${p.can_update ? 'checked' : ''} ${!canUpdatePerms ? 'disabled' : ''}/>
        </div>
      </div>
      <div class="perm-check">
        <div class="checkbox-wrap">
          <input type="checkbox" data-action="delete" ${p.can_delete ? 'checked' : ''} ${!canUpdatePerms ? 'disabled' : ''}/>
        </div>
      </div>
    </div>
  `).join('');

  // Hide quick actions if no update permission
  document.getElementById('quickActions').style.display = canUpdatePerms ? 'flex' : 'none';
}

async function savePermissions() {
  if (!currentRoleId) return;

  const rows = document.querySelectorAll('.perm-row[data-module-id]');
  const permissions = Array.from(rows).map(row => {
    const mid = parseInt(row.getAttribute('data-module-id'));
    return {
      module_id:  mid,
      can_create: row.querySelector('[data-action="create"]').checked,
      can_read:   row.querySelector('[data-action="read"]').checked,
      can_update: row.querySelector('[data-action="update"]').checked,
      can_delete: row.querySelector('[data-action="delete"]').checked,
    };
  });

  const btn = document.getElementById('savePermBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> Saving...`;

  const res = await api.put(`/permissions/${currentRoleId}`, { permissions });
  btn.disabled = false;
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Save Permissions`;

  if (res?.ok) {
    showToast('Success', 'Permissions saved successfully.', 'success');
    await onRoleChange(); // refresh
  } else {
    showToast('Error', res?.data?.message || 'Save failed.', 'error');
  }
}

function toggleAll(value) {
  document.querySelectorAll('.perm-row input[type="checkbox"]:not(:disabled)').forEach(cb => {
    cb.checked = value;
  });
}

function toggleColumn(action) {
  const cbs = document.querySelectorAll(`.perm-row input[data-action="${action}"]:not(:disabled)`);
  const allChecked = Array.from(cbs).every(cb => cb.checked);
  cbs.forEach(cb => cb.checked = !allChecked);
}
