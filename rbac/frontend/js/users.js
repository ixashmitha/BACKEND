// users.js
let allUsers  = [];
let allRoles  = [];
let canCreate = false, canUpdate = false, canDelete = false;

const user = requireAuth();
if (user) {
  document.getElementById('roleLabel').textContent = user.role_name;
  loadSidebar('Users');
  initUsers();
}

async function initUsers() {
  const [permRes, rolesRes] = await Promise.all([
    api.get('/permissions/module-permissions/Users'),
    api.get('/roles'),
  ]);

  if (permRes?.ok) {
    const p = permRes.data.data;
    canCreate = p.can_create;
    canUpdate = p.can_update;
    canDelete = p.can_delete;
    if (canCreate) document.getElementById('addUserBtn').style.display = 'inline-flex';
  }

  if (rolesRes?.ok) {
    allRoles = rolesRes.data.data || [];
    const sel = document.getElementById('userRole');
    allRoles.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.role_name;
      sel.appendChild(opt);
    });
  }

  await loadUsers();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderUsers(allUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  });
}

async function loadUsers() {
  const res = await api.get('/users');
  if (!res?.ok) {
    showToast('Error', res?.data?.message || 'Failed to load users.', 'error');
    return;
  }
  allUsers = res.data.data || [];
  renderUsers(allUsers);
}

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="data-empty">
      <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      <p>No users found.</p>
    </td></tr>`;
    return;
  }

  const currentUser = getUser();
  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td style="color:var(--text-muted)">${i + 1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#7c3aed);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:#fff;flex-shrink:0">${getInitials(u.name)}</div>
          <span style="font-weight:500">${u.name}</span>
        </div>
      </td>
      <td style="color:var(--text-secondary)">${u.email}</td>
      <td>${getRoleChip(u.role_name)}</td>
      <td style="color:var(--text-secondary)">${formatDate(u.created_at)}</td>
      <td>
        <div class="table-actions">
          ${canUpdate ? `<button class="btn btn-warning btn-sm" onclick="openEditModal(${u.id})">Edit</button>` : ''}
          ${canDelete && u.id !== currentUser?.id ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Delete</button>` : ''}
          ${!canUpdate && !canDelete ? '<span style="color:var(--text-muted);font-size:0.78rem">View only</span>' : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('userId').value       = '';
  document.getElementById('userName').value     = '';
  document.getElementById('userEmail').value    = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value     = '';
  document.getElementById('passwordGroup').style.display = 'block';
  document.getElementById('modalTitle').textContent      = 'Add User';
  document.querySelector('#passwordGroup label').textContent = 'Password *';
  openModal('userModal');
}

function openEditModal(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  document.getElementById('userId').value    = u.id;
  document.getElementById('userName').value  = u.name;
  document.getElementById('userEmail').value = u.email;
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value  = u.role_id;
  document.getElementById('passwordGroup').style.display = 'block';
  document.querySelector('#passwordGroup label').textContent = 'New Password (leave blank to keep)';
  document.getElementById('modalTitle').textContent = 'Edit User';
  openModal('userModal');
}

async function saveUser() {
  const id       = document.getElementById('userId').value;
  const name     = document.getElementById('userName').value.trim();
  const email    = document.getElementById('userEmail').value.trim();
  const password = document.getElementById('userPassword').value;
  const role_id  = document.getElementById('userRole').value;

  if (!name || !email || !role_id) { showToast('Validation', 'Name, email and role are required.', 'error'); return; }
  if (!id && !password) { showToast('Validation', 'Password is required for new users.', 'error'); return; }
  if (password && password.length < 6) { showToast('Validation', 'Password must be at least 6 characters.', 'error'); return; }

  const btn = document.getElementById('saveUserBtn');
  btn.disabled = true;

  const payload = { name, email, role_id: parseInt(role_id) };
  if (password) payload.password = password;

  const res = id ? await api.put(`/users/${id}`, payload) : await api.post('/users', payload);
  btn.disabled = false;

  if (res?.ok) {
    showToast('Success', id ? 'User updated.' : 'User created.', 'success');
    closeModal('userModal');
    await loadUsers();
  } else {
    showToast('Error', res?.data?.message || 'Operation failed.', 'error');
  }
}

async function deleteUser(id) {
  const ok = await confirmAction('Are you sure you want to delete this user?');
  if (!ok) return;
  const res = await api.delete(`/users/${id}`);
  if (res?.ok) {
    showToast('Deleted', 'User removed.', 'success');
    await loadUsers();
  } else {
    showToast('Error', res?.data?.message || 'Delete failed.', 'error');
  }
}
