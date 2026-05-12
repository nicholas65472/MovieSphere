async function loadHtmlIncludes() {
  const hosts = qsa('[data-include]');

  await Promise.all(hosts.map(async host => {
    const url = host.dataset.include;
    if (!url) return;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nu s-a putut incarca fragmentul HTML: ${url}`);
    }

    host.innerHTML = await response.text();
  }));
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadHtmlIncludes();
  } catch (error) {
    console.error(error);
  }

  loadState();
  updateUserUI();

  el('login-form')?.addEventListener('submit', handleLoginSubmit);
  el('register-form')?.addEventListener('submit', handleRegisterSubmit);
  el('vizualizare-form')?.addEventListener('submit', handleVizualizareSubmit);
  el('comentariu-form')?.addEventListener('submit', handleComentariuSubmit);

  el('viz-id-film')?.addEventListener('change', loadVersiuniForVizualizare);

  qsa('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      qsa('.modal-overlay.open').forEach(modal => closeModal(modal.id));
    }
  });

  navigate(state.currentPage || 'dashboard');
});
