function navigate(page, params = {}) {
  if (!canAccessPage(page)) {
    if (state.user) {
      showToast('Pagina este disponibila doar pentru administratori.', 'error');
    }
    page = defaultPageForUser();
    params = {};
  }

  state.currentPage = page;
  state.currentParams = params;

  qsa('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  qsa('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  const pageView = el(`page-${page}`);
  if (pageView) {
    pageView.classList.add('active');
  }

  updateTopbarTitle(page);

  if (typeof renderPage === 'function') {
    renderPage(page, params);
  } else {
    const target = el(`page-${page}`);
    if (target) {
      target.innerHTML = emptyState('alert-circle', 'Funcția renderPage nu este încărcată.');
    }
  }

  toggleSidebar(false);
}

function applyRoleNavigation() {
  const admin = isAdmin();

  qsa('[data-admin-only="true"]').forEach(item => {
    item.style.display = admin ? '' : 'none';
  });

  if (!canAccessPage(state.currentPage)) {
    navigate(defaultPageForUser());
  }
}

function updateTopbarTitle(page) {
  const titles = {
    dashboard: 'Dashboard',
    filme: 'Filme',
    top: 'Top Filme',
    actori: 'Actori',
    clienti: 'Clienți',
    statistici: 'Statistici',
    recomandari: 'Recomandări',
    predictii: 'Predicții Sezoniere',
    profil: 'Profilul Meu',
  };

  const title = el('topbar-title');
  if (title) title.textContent = titles[page] || page;
}

function handleGlobalSearch(event) {
  if (event.key !== 'Enter') return;

  const query = event.target.value.trim();
  navigate('filme', { q: query });
}

function toggleSidebar(open) {
  const sidebar = el('sidebar');
  const overlay = el('sidebar-overlay');

  if (sidebar) {
    sidebar.classList.toggle('open', Boolean(open));
  }

  if (overlay) {
    overlay.style.display = open ? 'block' : 'none';
  }
}
