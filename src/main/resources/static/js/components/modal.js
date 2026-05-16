function openModal(id) {
  const modal = el(id);
  if (!modal) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = el(id);
  if (!modal) return;

  modal.classList.remove('open');

  const anyOpen = qsa('.modal-overlay.open').length > 0;
  if (!anyOpen) {
    document.body.style.overflow = '';
  }
}

function initTabs(container) {
  if (!container) return;

  const buttons = qsa('.tab-btn', container);
  const panels = qsa('.tab-panel', container);

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      panels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');

      const target = el(button.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}
