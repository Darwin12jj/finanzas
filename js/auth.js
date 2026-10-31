'use strict';

function getRootPath() {
  return window.location.pathname.includes('/pages/') ? '../' : '';
}

function requireAuth(callback) {
  auth.onAuthStateChanged(user => {
    if (user) {
      const nameEl = document.getElementById('user-name');
      const avatarEl = document.getElementById('user-avatar');
      if (nameEl) nameEl.textContent = (user.displayName || 'Usuario').split(' ')[0];
      if (avatarEl && user.photoURL) avatarEl.src = user.photoURL;
      callback(user);
    } else {
      window.location.href = getRootPath() + 'login.html';
    }
  });
}

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => { window.location.href = 'index.html'; })
    .catch(err => {
      const el = document.getElementById('login-error');
      if (el) el.textContent = 'Error al iniciar sesión. Intenta de nuevo.';
    });
}

function logout() {
  if (confirm('¿Cerrar sesión?')) {
    auth.signOut().then(() => {
      window.location.href = getRootPath() + 'login.html';
    });
  }
}

// Mobile sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
});
