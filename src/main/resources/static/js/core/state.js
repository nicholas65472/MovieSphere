/* ── STATE ── */
const state = {
  user: null,
  currentPage: 'dashboard',
  currentParams: {},
  cache: {},
};

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
