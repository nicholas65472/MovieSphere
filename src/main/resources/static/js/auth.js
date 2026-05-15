/* ── USER UI ── */
function updateUserUI() {
  const nameEl = el('sidebar-user-name');
  const emailEl = el('sidebar-user-email');
  const avatarEl = el('sidebar-user-avatar');

  if (!nameEl || !emailEl || !avatarEl) return;

  if (state.user) {
    const fullName = `${state.user.prenume || ''} ${state.user.nume || ''}`.trim() || 'Client';
    nameEl.textContent = fullName;
    emailEl.textContent = isAdmin()
      ? `${state.user.email || ''} · ADMIN`
      : state.user.email || '';
    avatarEl.textContent = initials(fullName);
  } else {
    nameEl.textContent = 'Vizitator';
    emailEl.textContent = 'Click pentru login';
    avatarEl.textContent = '?';
  }

  applyRoleNavigation();
}

function handleUserClick() {
  if (state.user) {
    navigate('profil');
  } else {
    openModal('modal-login');
  }
}

function logout() {
  saveUser(null);
  updateUserUI();
  showToast('Ai ieșit din cont.', 'success');
  navigate(defaultPageForUser());
}

/* ── AUTH ── */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = el('login-email')?.value.trim();
  const parola = el('login-parola')?.value;

  if (!email || !parola) {
    showToast('Completează emailul și parola.', 'error');
    return;
  }

  try {
    const user = await API.clienti.login({ email, parola });

    saveUser(user);
    updateUserUI();
    closeModal('modal-login');

    showToast('Autentificare reușită.', 'success');
    navigate(defaultPageForUser());
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();

  const payload = {
    nume: el('reg-nume')?.value.trim(),
    prenume: el('reg-prenume')?.value.trim(),
    email: el('reg-email')?.value.trim(),
    parola: el('reg-parola')?.value,
    telefon: el('reg-telefon')?.value.trim(),
    oras: el('reg-oras')?.value.trim(),
  };

  try {
    await API.clienti.inregistrare(payload);

    closeModal('modal-register');
    openModal('modal-login');

    const loginEmail = el('login-email');
    if (loginEmail) loginEmail.value = payload.email;

    showToast('Cont creat. Te poți autentifica.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
