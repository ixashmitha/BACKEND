// roles.js
let allRoles  = [];
let allUsers  = [];
let canCreate = false, canDelete = false;
const SYSTEM_ROLES = [1, 2, 3, 4];

const user = requireAuth();
if (user) {
  document.getElementById('roleLabel').textContent = user.role_name;
  loadSidebar('RoleManagement');
  initRoles();
}

async function initRoles() {
  const permRes = await api.get('/permissions/module-permissions/RoleManagement');
  if (permRes?.ok) {
    const p = permRes.data.data;
    canCreate = p.can_create;
    canDelete = p.can_delete;
    if (canCreate) document.getElementById('addRoleBtn').style.display = 'inline-flex';
  }

  // Load users for count reference
  const usersRes = await api.get('/users');
  if (usersRes?.ok) allUsers = usersRes.data.data || [];

  await loadRoles();
}

async function loadRoles() {
  const res = await api.get('/roles');
  if (!res?.ok) {
    showToast('Error', res?.data?.message || 'Failed to load roles.', 'error');
    return;
  }
  allRoles = res.data.data || [];
  renderRoles(allRoles);
}

function renderRoles(roles) {
  const tbody = document.getElementById('rolesTableBody');

  if (roles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="data-empty"><p>No roles found.</p></td></tr>`;
    return;
  }

  const roleColors = {
    'SuperAdmin': 'chip-amber', 'Admin': 'chip-blue',
    'Manager': 'chip-green', 'Employee': 'chip-gray'
  };

  tbody.innerHTML = roles.map((r, i) => {
    const isSystem = SYSTEM_ROLES.includes(r.id);
    const userCount = allUsers.filter(u => u.role_id === r.id).length;

    return `
      <tr>
        <td style="color:var(--text-muted)">${i + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:${isSystem ? 'var(--accent)' : 'var(--success)'}"></div>
            <span style="font-weight:500">${r.role_name}</span>
          </div>
        </td>
        <td>
          ${isSystem
            ? `<span class="chip chip-blue">System</span>`
            : `<span class="chip chip-green">Custom</span>`
          }
        </td>
        <td style="color:var(--text-secondary)">${formatDate(r.created_at)}</td>
        <td>
          <span class="chip chip-gray">${userCount} user${userCount !== 1 ? 's' : ''}</span>
        </td>
        <td>
          <div class="table-actions">
            <a class="btn btn-secondary btn-sm" href="/permissions.html?roleId=${r.id}">
              <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Permissions
            </a>
            ${canDelete && !isSystem
              ? `<button class="btn btn-danger btn-sm" onclick="deleteRole(${r.id}, '${r.role_name}')">Delete</button>`
              : isSystem ? `<span style="color:var(--text-muted);font-size:0.75rem">Protected</span>` : ''
            }
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddModal() {
  document.getElementById('roleName').value = '';
  openModal('roleModal');
}

async function saveRole() {
  const name = document.getElementById('roleName').value.trim();
  if (!name) { showToast('Validation', 'Role name is required.', 'error'); return; }
  if (/\s/.test(name)) { showToast('Validation', 'Role name cannot contain spaces.', 'error'); return; }

  const btn = document.getElementById('saveRoleBtn');
  btn.disabled = true;

  const res = await api.post('/roles', { role_name: name });
  btn.disabled = false;

  if (res?.ok) {
    showToast('Success', `Role "${name}" created.`, 'success');
    closeModal('roleModal');
    await loadRoles();
  } else {
    showToast('Error', res?.data?.message || 'Failed to create role.', 'error');
  }
}

async function deleteRole(id, name) {
  const ok = await confirmAction(`Delete role "${name}"? This cannot be undone.`);
  if (!ok) return;
  const res = await api.delete(`/roles/${id}`);
  if (res?.ok) {
    showToast('Deleted', `Role "${name}" removed.`, 'success');
    await loadRoles();
  } else {
    showToast('Error', res?.data?.message || 'Delete failed.', 'error');
  }
}
