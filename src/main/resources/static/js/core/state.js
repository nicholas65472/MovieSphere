const state = {
  user: null,
  currentPage: 'dashboard',
  currentParams: {},
  cache: {},
};

const ADMIN_ONLY_PAGES = new Set(['dashboard', 'clienti', 'statistici', 'predictii']);

function isAdmin() {
  return String(state.user?.rol || '').toUpperCase() === 'ADMIN';
}

function defaultPageForUser() {
  return isAdmin() ? 'dashboard' : 'filme';
}

function canAccessPage(page) {
  return !ADMIN_ONLY_PAGES.has(page) || isAdmin();
}

function loadState() {
  const saved = sessionStorage.getItem('ms_user');

  if (saved) {
    try {
      state.user = JSON.parse(saved);
    } catch {
      state.user = null;
      sessionStorage.removeItem('ms_user');
    }
  }
}

function saveUser(user) {
  state.user = user;

  if (user) {
    sessionStorage.setItem('ms_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('ms_user');
  }
}
