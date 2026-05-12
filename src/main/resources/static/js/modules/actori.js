async function renderActori() {
  const cont = el('page-actori');

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>ACTORI</h1>
        <p>Toți actorii din platformă</p>
      </div>

      <div style="display:flex;gap:10px">
        <input class="form-input" id="search-actori" placeholder="Caută actor..." style="width:220px">
      </div>
    </div>

    <div class="actor-grid" id="actor-grid">${loading()}</div>
  `;

  let actori = [];

  try {
    actori = await API.actori.getAll();
    renderActorGrid(actori);
  } catch (error) {
    el('actor-grid').innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }

  el('search-actori')?.addEventListener('input', event => {
    const query = event.target.value.toLowerCase();

    const filtered = actori.filter(actor => {
      const nume = String(actor.numeScena || actor.nume_scena || '').toLowerCase();
      const nationalitate = String(actor.nationalitate || '').toLowerCase();

      return nume.includes(query) || nationalitate.includes(query);
    });

    renderActorGrid(filtered);
  });
}

function renderActorGrid(actori) {
  const grid = el('actor-grid');
  if (!grid) return;

  if (!actori?.length) {
    grid.innerHTML = emptyState('user-off', 'Niciun actor găsit.');
    return;
  }

  grid.innerHTML = actori.map(actor => {
    const nume = actor.numeScena || actor.nume_scena || '—';

    return `
      <div class="actor-card" onclick="openActorDetail(${actor.id})">
        <div class="actor-avatar">${initials(nume)}</div>
        <div class="actor-name">${escHtml(nume)}</div>
        <div class="actor-nat">${escHtml(actor.nationalitate || '—')}</div>
        ${(actor.dataNasterii || actor.data_nasterii) ? `
          <div class="actor-nat" style="margin-top:3px">
            ${fmtDate(actor.dataNasterii || actor.data_nasterii)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

async function openActorDetail(id) {
  const modal = el('modal-actor');
  const body = el('modal-actor-body');

  if (!modal || !body) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  body.innerHTML = loading('Se încarcă detalii actor...');

  try {
    const [actor, filme, comentarii] = await Promise.all([
      API.actori.getById(id),
      API.actori.getFilme(id),
      API.actori.getComentarii(id),
    ]);

    const numeScena = actor.numeScena || actor.nume_scena || '—';
    const numeReal = `${actor.prenume || ''} ${actor.numeFamilie || actor.nume_familie || ''}`.trim();

    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <div class="actor-avatar" style="width:72px;height:72px;font-size:28px;flex-shrink:0">
          ${initials(numeScena)}
        </div>

        <div>
          <h2 style="font-family:var(--font-display);font-size:26px;letter-spacing:.5px">
            ${escHtml(numeScena)}
          </h2>

          ${numeReal ? `
            <p style="color:var(--text2);font-size:14px">${escHtml(numeReal)}</p>
          ` : ''}

          <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
            ${actor.nationalitate ? `<span class="badge badge-blue">${escHtml(actor.nationalitate)}</span>` : ''}

            ${(actor.dataNasterii || actor.data_nasterii) ? `
              <span class="badge badge-neutru">
                <i class="ti ti-calendar"></i>
                ${fmtDate(actor.dataNasterii || actor.data_nasterii)}
              </span>
            ` : ''}
          </div>
        </div>
      </div>

      ${actor.biografie ? `
        <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:20px">
          ${escHtml(actor.biografie)}
        </p>
      ` : ''}

      <div class="tabs" id="actor-tabs-wrap">
        <button class="tab-btn active" data-tab="tab-actor-filme">Filme (${filme.length})</button>
        <button class="tab-btn" data-tab="tab-actor-comentarii">Comentarii (${comentarii.length})</button>
      </div>

      <div class="tab-panel active" id="tab-actor-filme">
        ${renderActorFilme(filme)}
      </div>

      <div class="tab-panel" id="tab-actor-comentarii">
        ${renderActorComentarii(comentarii)}
      </div>
    `;

    initTabs(el('actor-tabs-wrap')?.parentElement);
  } catch (error) {
    body.innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }
}

function renderActorFilme(filme) {
  if (!filme?.length) {
    return emptyState('movie-off', 'Niciun film înregistrat.');
  }

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${filme.map(film => {
        const idFilm = film.id || film.id_film || film.idFilm;
        const poster = film.posterUrl || film.poster_url;

        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg3);border-radius:var(--radius);cursor:pointer"
               onclick="closeModal('modal-actor');openFilmDetail(${idFilm})">

            <div style="width:40px;height:60px;border-radius:6px;background:var(--bg4);overflow:hidden;flex-shrink:0">
              ${poster
                ? `<img src="${escHtml(poster)}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`
                : '<div style="height:100%;display:flex;align-items:center;justify-content:center"><i class="ti ti-movie" style="color:var(--text3)"></i></div>'}
            </div>

            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:500">${escHtml(film.titlu)}</div>
              <div style="font-size:12px;color:var(--text3)">
                ${escHtml(film.rol || '—')} · ${escHtml(film.tipRol || film.tip_rol || '—')}
              </div>
            </div>

            <div style="font-size:13px;color:var(--accent)">
              ${fmtRating(film.rating)}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderActorComentarii(comentarii) {
  if (!comentarii?.length) {
    return emptyState('message-off', 'Niciun comentariu.');
  }

  return comentarii.map(comentariu => {
    const autor = comentariu.autor || comentariu.numeClient || comentariu.nume_client || 'Anonim';
    const film = comentariu.film || comentariu.titluFilm || comentariu.titlu_film;

    return `
      <div style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:13px;font-weight:500">${escHtml(autor)}</span>
          <span style="font-size:11px;color:var(--text3)">
            ${fmtDateTime(comentariu.dataComentariu || comentariu.data_comentariu)}
          </span>
        </div>

        ${film ? `
          <div style="font-size:12px;color:var(--text3);margin-bottom:4px">
            în <em>${escHtml(film)}</em>
          </div>
        ` : ''}

        <p style="font-size:14px;color:var(--text2)">
          ${escHtml(comentariu.continut)}
        </p>
      </div>
    `;
  }).join('');
}
