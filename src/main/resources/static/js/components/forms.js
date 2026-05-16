function buildRatingPicker(containerId, onSelect) {
  const container = el(containerId);
  if (!container) return () => 0;

  let selected = 0;

  container.innerHTML = Array.from({ length: 10 }, (_, index) => {
    return `<i class="ti ti-star" data-val="${index + 1}"></i>`;
  }).join('');

  const stars = qsa('i', container);

  function update(value) {
    stars.forEach((star, index) => {
      star.style.color = index < value ? 'var(--accent)' : 'var(--text3)';
    });
  }

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => update(Number(star.dataset.val)));
    star.addEventListener('mouseleave', () => update(selected));

    star.addEventListener('click', () => {
      selected = Number(star.dataset.val);
      update(selected);

      if (typeof onSelect === 'function') {
        onSelect(selected);
      }
    });
  });

  container.addEventListener('mouseleave', () => update(selected));

  return () => selected;
}

function getFilmId(film) {
  return film.id || film.idFilm || film.id_film;
}

async function loadFilmeForVizualizare(idFilmPreselectat = null) {
  const filmSelect = el('viz-id-film');
  const versionSelect = el('viz-id-versiune');

  if (!filmSelect) return;

  filmSelect.innerHTML = '<option value="">Se încarcă filmele disponibile...</option>';

  if (versionSelect) {
    versionSelect.innerHTML = '<option value="">Alege mai întâi filmul</option>';
  }

  try {
    const filme = await API.filme.getAll();

    if (!filme.length) {
      filmSelect.innerHTML = '<option value="">Nu există filme disponibile</option>';
      return;
    }

    filmSelect.innerHTML = `
      <option value="">Alege filmul (${filme.length} filme disponibile)</option>
      ${filme.map(film => {
        const idFilm = getFilmId(film);
        const label = [
          film.titlu || `Film ${idFilm}`,
          film.categorie || film.numeCategorie,
          film.rating ? `rating ${fmtRating(film.rating)}` : null,
        ].filter(Boolean).join(' · ');

        return `<option value="${escHtml(idFilm)}">${escHtml(label)}</option>`;
      }).join('')}
    `;

    if (idFilmPreselectat) {
      filmSelect.value = String(idFilmPreselectat);
      await loadVersiuniForVizualizare();
    }
  } catch (error) {
    filmSelect.innerHTML = '<option value="">Nu s-au putut încărca filmele</option>';
    showToast(error.message, 'error');
  }
}

function openVizualizareModal(idFilm) {
  if (!state.user) {
    openModal('modal-login');
    return;
  }

  openModal('modal-vizualizare');
  loadFilmeForVizualizare(idFilm || null);
}

async function loadVersiuniForVizualizare() {
  const idFilm = el('viz-id-film')?.value;
  const select = el('viz-id-versiune');

  if (!select) return;

  if (!idFilm) {
    select.innerHTML = '<option value="">Alege mai întâi filmul</option>';
    return;
  }

  select.innerHTML = '<option value="">Se încarcă versiunile...</option>';

  try {
    const versiuni = await API.filme.getVersiuni(idFilm);

    if (!versiuni || versiuni.length === 0) {
      select.innerHTML = '<option value="">Fără versiune specifică</option>';
      return;
    }

    select.innerHTML = `
      <option value="">Fără versiune specifică</option>
      ${versiuni.map(versiune => {
        const label = [
          versiune.format,
          versiune.rezolutie,
          versiune.limba,
          versiune.subtitrare ? `subtitrare ${versiune.subtitrare}` : null,
        ].filter(Boolean).join(' · ');

        return `
          <option value="${escHtml(versiune.id)}">
            ${escHtml(label || `Versiune ${versiune.id}`)}
          </option>
        `;
      }).join('')}
    `;
  } catch {
    select.innerHTML = '<option value="">Nu s-au putut încărca versiunile</option>';
  }
}

async function handleVizualizareSubmit(event) {
  event.preventDefault();

  if (!state.user) {
    showToast('Trebuie să fii autentificat.', 'error');
    openModal('modal-login');
    return;
  }

  const idFilmRaw = el('viz-id-film')?.value;
  const idVersiuneRaw = el('viz-id-versiune')?.value;
  const votRaw = el('viz-vot')?.value.trim();

  if (!idFilmRaw) {
    showToast('Alege un film.', 'error');
    return;
  }

  const payload = {
    idClient: Number(state.user.id),
    idFilm: Number(idFilmRaw),
    idVersiune: idVersiuneRaw ? Number(idVersiuneRaw) : null,
    vot: votRaw ? Number(votRaw) : null,
  };

  try {
    await API.vizualizari.add(payload);

    closeModal('modal-vizualizare');

    const form = el('vizualizare-form');
    if (form) form.reset();

    const filmSelect = el('viz-id-film');
    const versionSelect = el('viz-id-versiune');

    if (filmSelect) {
      filmSelect.innerHTML = '<option value="">Se încarcă filmele disponibile...</option>';
    }

    if (versionSelect) {
      versionSelect.innerHTML = '<option value="">Alege mai întâi filmul</option>';
    }

    showToast('Vizualizarea a fost salvată.', 'success');

    if (state.currentPage) {
      navigate(state.currentPage, state.currentParams || {});
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadComentariuOptions() {
  const container = el('comentariu-optiuni');
  if (!container) return;

  try {
    const options = await API.comentarii.optiuni();

    container.innerHTML = options.map(option => `
      <label class="option-chip" data-option-id="${escHtml(option.id)}">
        <input type="checkbox" value="${escHtml(option.id)}" style="display:none">
        ${escHtml(option.eticheta || option.cod)}
      </label>
    `).join('');

    qsa('.option-chip', container).forEach(chip => {
      chip.addEventListener('click', () => {
        const input = qs('input', chip);
        if (!input) return;

        input.checked = !input.checked;
        chip.classList.toggle('selected', input.checked);
      });
    });
  } catch {
    container.innerHTML = '<span style="color:var(--text3);font-size:13px">Opțiunile nu au putut fi încărcate.</span>';
  }
}

function openComentariuModal(idFilm, titlu = '') {
  if (!state.user) {
    openModal('modal-login');
    return;
  }

  const input = el('comentariu-id-film');
  const title = el('comentariu-title');
  const content = el('comentariu-continut');

  if (input) input.value = idFilm || '';
  if (title) title.textContent = titlu ? `Comentariu: ${titlu}` : 'Comentariu film';
  if (content) content.value = '';

  loadComentariuOptions();
  openModal('modal-comentariu');
}

async function handleComentariuSubmit(event) {
  event.preventDefault();

  if (!state.user) {
    showToast('Trebuie să fii autentificat.', 'error');
    openModal('modal-login');
    return;
  }

  const options = qsa('#comentariu-optiuni input:checked')
    .map(input => Number(input.value));

  const payload = {
    idClient: Number(state.user.id),
    idFilm: Number(el('comentariu-id-film')?.value),
    continut: el('comentariu-continut')?.value.trim(),
    optiuniSelectate: options,
  };

  try {
    await API.comentarii.add(payload);

    closeModal('modal-comentariu');
    showToast('Comentariul a fost salvat.', 'success');

    if (payload.idFilm && typeof openFilmDetail === 'function') {
      await openFilmDetail(payload.idFilm);
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
