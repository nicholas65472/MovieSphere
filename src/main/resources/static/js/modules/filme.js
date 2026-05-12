async function renderFilme(params = {}) {
  const cont = el('page-filme');
  let categorii = [];

  try {
    categorii = await API.categorii.getAll();
  } catch {
    categorii = [];
  }

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>FILME</h1>
        <p>Biblioteca completă de filme</p>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <input class="form-input" id="filter-search-film" placeholder="Caută film..." style="width:180px" value="${escHtml(params.q || '')}">

        <select class="form-input" id="filter-categorie" style="width:200px">
          <option value="">Toate categoriile</option>
          ${categorii.map(categorie => `
            <option value="${escHtml(categorie.nume)}">${escHtml(categorie.nume)}</option>
          `).join('')}
        </select>

        <select class="form-input" id="filter-sort" style="width:140px">
          <option value="rating">Rating desc.</option>
          <option value="voturi">Nr. voturi</option>
          <option value="titlu">Titlu A-Z</option>
        </select>

        <button class="btn btn-primary" onclick="navigate('top')">
          <i class="ti ti-trophy"></i>
          Top filme
        </button>
      </div>
    </div>

    <div class="film-grid" id="film-grid">${loading()}</div>
  `;

  let allFilme = [];

  try {
    allFilme = await API.filme.getAll(params.q || '');
    applyFilmFilters(allFilme);
  } catch (error) {
    el('film-grid').innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }

  el('filter-search-film')?.addEventListener('input', () => applyFilmFilters(allFilme));
  el('filter-categorie')?.addEventListener('change', () => applyFilmFilters(allFilme));
  el('filter-sort')?.addEventListener('change', () => applyFilmFilters(allFilme));
}

function applyFilmFilters(films) {
  const query = el('filter-search-film')?.value.trim().toLowerCase() || '';
  const categorie = el('filter-categorie')?.value || '';
  const sort = el('filter-sort')?.value || 'rating';

  let result = [...films];

  if (query) {
    result = result.filter(film =>
      String(film.titlu || '').toLowerCase().includes(query)
    );
  }

  if (categorie) {
    result = result.filter(film =>
      String(film.categorie || film.numeCategorie || '').toLowerCase() === categorie.toLowerCase()
    );
  }

  if (sort === 'rating') {
    result.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
  } else if (sort === 'voturi') {
    result.sort((a, b) =>
      parseInt(b.numarVoturi || b.numar_voturi || 0) -
      parseInt(a.numarVoturi || a.numar_voturi || 0)
    );
  } else {
    result.sort((a, b) => String(a.titlu || '').localeCompare(String(b.titlu || '')));
  }

  renderFilmGrid(result);
}

function renderFilmGrid(films) {
  const grid = el('film-grid');
  if (!grid) return;

  if (!films?.length) {
    grid.innerHTML = emptyState('movie-off', 'Nu s-au găsit filme.');
    return;
  }

  grid.innerHTML = films.map(film => {
    const idFilm = film.id || film.idFilm || film.id_film;
    const poster = film.posterUrl || film.poster_url;
    const voturi = film.numarVoturi || film.numar_voturi;

    return `
      <div class="film-card" onclick="openFilmDetail(${idFilm})">
        <div class="film-poster">
          ${poster
            ? `<img src="${escHtml(poster)}" alt="${escHtml(film.titlu)}" loading="lazy"
                onerror="this.parentElement.innerHTML='<div class=\\'film-poster-placeholder\\'><i class=\\'ti ti-movie\\'></i></div>'">`
            : `<div class="film-poster-placeholder"><i class="ti ti-movie"></i></div>`
          }

          <div class="film-badge">
            <i class="ti ti-star-filled" style="font-size:11px"></i>
            ${fmtRating(film.rating)}
          </div>
        </div>

        <div class="film-info">
          <div class="film-title">${escHtml(film.titlu)}</div>

          <div class="film-meta">
            <span class="film-category">${escHtml(film.categorie || film.numeCategorie || '')}</span>
            ${voturi ? `<span>${voturi} voturi</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function buildTrailerUrl(title) {
  const query = encodeURIComponent(`${title || ''} official trailer`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

async function openFilmDetail(id) {
  const modal = el('modal-film');
  const body = el('modal-film-body');

  if (!modal || !body) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  body.innerHTML = loading('Se încarcă detalii film...');

  try {
    const [film, versiuni, distributie, comentarii] = await Promise.all([
      API.filme.getById(id),
      API.filme.getVersiuni(id),
      API.filme.getDistributie(id),
      API.filme.getComentarii(id),
    ]);

    const trailerUrl = buildTrailerUrl(film.titlu);

    body.innerHTML = `
      <div class="detail-layout">
        <div class="detail-side">
          <div class="detail-poster">
            ${film.posterUrl || film.poster_url
              ? `<img src="${escHtml(film.posterUrl || film.poster_url)}" alt="${escHtml(film.titlu)}">`
              : `<div class="film-poster-placeholder" style="height:100%"><i class="ti ti-movie" style="font-size:60px"></i></div>`}
          </div>

          <div style="margin-top:12px">
            <div class="detail-meta-row">
              <i class="ti ti-star"></i>
              <span>Rating: <strong style="color:var(--accent)">${fmtRating(film.rating)}</strong>/10</span>
            </div>

            <div class="detail-meta-row">
              <i class="ti ti-thumb-up"></i>
              <span>${film.numarVoturi ?? film.numar_voturi ?? 0} voturi</span>
            </div>

            <div class="detail-meta-row">
              <i class="ti ti-calendar"></i>
              <span>${fmtDate(film.dataLansarii || film.data_lansarii)}</span>
            </div>

            <div class="detail-meta-row">
              <i class="ti ti-clock"></i>
              <span>${film.durataMinute || film.durata_minute || '—'} min</span>
            </div>

            <div class="detail-meta-row">
              <i class="ti ti-tag"></i>
              <span>${escHtml(film.categorie || film.numeCategorie || '—')}</span>
            </div>
          </div>

          <div class="detail-actions">
            <a class="btn btn-secondary btn-sm" style="width:100%" href="${escHtml(trailerUrl)}" target="_blank" rel="noopener noreferrer">
              <i class="ti ti-brand-youtube"></i>
              Vezi trailer
            </a>

            ${state.user ? `
              <button class="btn btn-primary btn-sm" style="width:100%" onclick="openVizualizareModal(${id})">
                <i class="ti ti-player-play"></i>
                Inregistrare vizualizare
              </button>

              <button class="btn btn-secondary btn-sm" style="width:100%" onclick="openComentariuModal(${id}, '${escHtml(film.titlu)}')">
                <i class="ti ti-message-plus"></i>
                Lasă comentariu
              </button>
            ` : ''}
          </div>
        </div>

        <div>
          <h2 style="font-family:var(--font-display);font-size:28px;letter-spacing:1px;margin-bottom:6px">
            ${escHtml(film.titlu)}
          </h2>

          <p style="color:var(--text2);font-size:14px;margin-bottom:14px;line-height:1.55">
            ${escHtml(film.descriere || 'Fără descriere.')}
          </p>

          <div class="tabs" id="film-tabs">
            <button class="tab-btn active" data-tab="tab-versiuni">Versiuni (${versiuni.length})</button>
            <button class="tab-btn" data-tab="tab-distributie">Distribuție (${distributie.length})</button>
            <button class="tab-btn" data-tab="tab-comentarii">Comentarii (${comentarii.length})</button>
          </div>

          <div class="tab-panel active" id="tab-versiuni">
            ${renderFilmVersiuni(versiuni)}
          </div>

          <div class="tab-panel" id="tab-distributie">
            ${renderFilmDistributie(distributie)}
          </div>

          <div class="tab-panel" id="tab-comentarii">
            ${renderFilmComentarii(comentarii)}
          </div>
        </div>
      </div>
    `;

    initTabs(el('film-tabs')?.parentElement);
  } catch (error) {
    body.innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }
}

function renderFilmVersiuni(versiuni) {
  if (!versiuni?.length) {
    return emptyState('versions', 'Nicio versiune disponibilă.');
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Format</th>
            <th>Rezoluție</th>
            <th>Limbă</th>
            <th>Subtitrare</th>
          </tr>
        </thead>
        <tbody>
          ${versiuni.map(v => `
            <tr>
              <td><span class="badge badge-blue">${escHtml(v.format)}</span></td>
              <td>${escHtml(v.rezolutie || '—')}</td>
              <td>${escHtml(v.limba || '—')}</td>
              <td>${escHtml(v.subtitrare || 'fără')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderFilmDistributie(distributie) {
  if (!distributie?.length) {
    return emptyState('users', 'Nicio distribuție înregistrată.');
  }

  return `
    <div class="actor-grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">
      ${distributie.map(actor => {
        const idActor = actor.idActor || actor.id_actor || actor.id;
        const nume = actor.numeScena || actor.nume_scena || '—';
        const tipRol = actor.tipRol || actor.tip_rol || '—';

        return `
          <div class="actor-card" onclick="closeModal('modal-film');navigate('actori');setTimeout(()=>openActorDetail(${idActor}),100)">
            <div class="actor-avatar">${initials(nume)}</div>
            <div class="actor-name">${escHtml(nume)}</div>
            <div class="actor-nat">${escHtml(actor.rol || '—')}</div>
            <span class="badge badge-${tipRol === 'Principal' ? 'yellow' : 'neutru'}" style="margin-top:4px;font-size:11px">
              ${escHtml(tipRol)}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderFilmComentarii(comentarii) {
  if (!comentarii?.length) {
    return emptyState('message-off', 'Niciun comentariu.');
  }

  return comentarii.map(comentariu => {
    const autor = comentariu.autor || comentariu.numeClient || comentariu.nume_client || 'Anonim';

    return `
      <div style="padding:14px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div class="client-avatar-sm">${initials(autor)}</div>

          <div>
            <div style="font-size:13px;font-weight:500">${escHtml(autor)}</div>
            <div style="font-size:11px;color:var(--text3)">
              ${fmtDateTime(comentariu.dataComentariu || comentariu.data_comentariu)}
            </div>
          </div>

          <div style="margin-left:auto">
            ${sentimentBadge(comentariu.sentiment)}
          </div>
        </div>

        <p style="font-size:14px;color:var(--text2);line-height:1.6">
          ${escHtml(comentariu.continut)}
        </p>
      </div>
    `;
  }).join('');
}

/* ── ACTORI ── */
