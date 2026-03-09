// ── Auth Utilities ──────────────────────────────────────────

function getUser() {
  try {
    const u = localStorage.getItem('rbac_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

function getToken() {
  return localStorage.getItem('rbac_token');
}

function requireAuth() {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('rbac_token');
  localStorage.removeItem('rbac_user');
  window.location.href = '/login.html';
}

// ── Login Page Logic ────────────────────────────────────────
if (document.getElementById('loginForm')) {

  // Redirect if already logged in
  if (getToken()) window.location.href = '/dashboard.html';

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('loginBtn');
    const errDiv   = document.getElementById('loginError');

    if (!email || !password) {
      errDiv.textContent = 'Please enter email and password.';
      errDiv.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> Signing in...`;
    errDiv.style.display = 'none';

    try {
      const res = await fetch(`${window.location.origin}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('rbac_token', data.token);
        localStorage.setItem('rbac_user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
      } else {
        errDiv.textContent = data.message || 'Invalid credentials.';
        errDiv.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>Sign In`;
      }
    } catch (err) {
      errDiv.textContent = 'Server error. Please try again.';
      errDiv.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  });
}
