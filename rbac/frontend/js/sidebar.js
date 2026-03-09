// ── Dynamic Sidebar ─────────────────────────────────────────

const MODULE_ICONS = {
  Dashboard:           `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  Reports:             `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  Users:               `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
  Settings:            `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>`,
  RoleManagement:      `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  PermissionManagement:`<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
};

const MODULE_ROUTES = {
  Dashboard:           'dashboard.html',
  Reports:             'reports.html',
  Users:               'users.html',
  Settings:            'settings.html',
  RoleManagement:      'roleManagement.html',
  PermissionManagement:'permissions.html',
};

async function loadSidebar(activePage) {
  const user = requireAuth();
  if (!user) return;

  // Fill user card
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role_name);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = getInitials(user.name));

  const navContainer = document.getElementById('sidebarNav');
  if (!navContainer) return;

  navContainer.innerHTML = `<div style="padding:10px;text-align:center"><span class="spinner"></span></div>`;

  const res = await api.get('/permissions/modules');
  if (!res || !res.ok) {
    navContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.8rem;padding:10px">Failed to load menu.</p>`;
    return;
  }

  const modules = res.data.data || [];

  // Group into "Main" and "Admin" sections
  const adminModules = ['RoleManagement', 'PermissionManagement'];
  const mainModules  = modules.filter(m => !adminModules.includes(m.module_name));
  const adminMods    = modules.filter(m => adminModules.includes(m.module_name));

  let html = '';

  if (mainModules.length > 0) {
    html += `<div class="nav-section-label">Main Menu</div>`;
    mainModules.forEach(mod => {
      const icon   = MODULE_ICONS[mod.module_name] || MODULE_ICONS.Dashboard;
      const route  = MODULE_ROUTES[mod.module_name] || '#';
      const active = activePage === mod.module_name ? 'active' : '';
      html += `
        <a class="nav-item ${active}" href="/${route}">
          ${icon}
          <span>${mod.module_name.replace(/([A-Z])/g, ' $1').trim()}</span>
        </a>`;
    });
  }

  if (adminMods.length > 0) {
    html += `<div class="nav-section-label">Administration</div>`;
    adminMods.forEach(mod => {
      const icon   = MODULE_ICONS[mod.module_name] || MODULE_ICONS.Settings;
      const route  = MODULE_ROUTES[mod.module_name] || '#';
      const active = activePage === mod.module_name ? 'active' : '';
      html += `
        <a class="nav-item ${active}" href="/${route}">
          ${icon}
          <span>${mod.module_name.replace(/([A-Z])/g, ' $1').trim()}</span>
        </a>`;
    });
  }

  navContainer.innerHTML = html || `<p style="color:var(--text-muted);font-size:0.8rem;padding:10px">No modules available.</p>`;

  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', logout);
  });
}
