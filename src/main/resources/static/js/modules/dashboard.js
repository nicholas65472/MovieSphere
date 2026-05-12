async function renderDashboard() {
  const cont = el('page-dashboard');

  cont.innerHTML = `
    <div class="vintage-dashboard">
      <section class="vintage-hero">
        <div class="vintage-hero-head">
          <div>
            <span class="vintage-kicker">Tablou live</span>
            <h1>${state.user ? 'Bine ai venit, ' + escHtml(state.user.prenume || 'cinefil') : 'Programul serii'}</h1>
          </div>
          <span class="vintage-live"><i></i> live</span>
        </div>
        <div id="dash-feature">${loading('Se incarca afisul...')}</div>
      </section>

      <section class="vintage-panel">
        <div class="vintage-panel-head">
          <span>Sentiment public</span>
          <small>ultimele reactii</small>
        </div>
        <div id="dash-sentimente">${loading()}</div>
      </section>

      <section class="vintage-panel">
        <div class="vintage-panel-head">
          <span>Jurnal vizionari</span>
          <a href="#" onclick="navigate('filme');return false;">catalog</a>
        </div>
        <div id="dash-top-filme">${loading()}</div>
      </section>

      <section class="vintage-panel vintage-blueprint">
        <div class="vintage-panel-head">
          <span>Filme comentate</span>
          <a href="#" onclick="navigate('statistici');return false;">raport</a>
        </div>
        <div id="dash-comentate">${loading()}</div>
      </section>
    </div>

    <div class="stats-grid vintage-meters" id="dash-stats">${loading()}</div>

    <section class="vintage-panel vintage-wide">
      <div class="vintage-panel-head">
        <span>Clienti activi</span>
        ${state.user ? `
          <button class="btn btn-primary btn-sm" onclick="openVizualizareModal()">
            <i class="ti ti-plus"></i>
            Adauga vizualizare
          </button>
        ` : ''}
      </div>
      <div id="dash-top-clienti">${loading()}</div>
    </section>
  `;

  try {
    const [stats, top, sentimente, topClienti, comentate] = await Promise.all([
      API.statistici.generale(),
      API.filme.top(null, 5),
      API.statistici.sentimente(),
      API.statistici.topClienti(5),
      API.statistici.filmeComentate(5),
    ]);

    const filmeActive = stats.filme_active ?? stats.filmeActive ?? stats.total_filme ?? '-';
    const clientiActivi = stats.clienti_activi ?? stats.clientiActivi ?? stats.total_clienti ?? '-';
    const vizualizari = stats.vizualizari_totale ?? stats.vizualizariTotale ?? stats.total_vizualizari ?? '-';
    const comentarii = stats.comentarii_totale ?? stats.comentariiTotale ?? stats.total_comentarii ?? '-';
    const featured = (top || [])[0];
    const featuredId = featured ? (featured.idFilm || featured.id_film || featured.id) : null;

    let featuredDetails = null;
    if (featuredId) {
      try {
        featuredDetails = await API.filme.getById(featuredId);
      } catch {
        featuredDetails = null;
      }
    }

    const poster =
      featuredDetails?.posterUrl ||
      featuredDetails?.poster_url ||
      featured?.posterUrl ||
      featured?.poster_url ||
      '';

    const title = featuredDetails?.titlu || featured?.titlu || 'Film in program';
    const category = featuredDetails?.categorie || featured?.categorie || 'Selectie MovieSphere';
    const rating = featuredDetails?.rating || featured?.rating;
    const votes = featuredDetails?.numarVoturi || featuredDetails?.numar_voturi || featured?.numarVoturi || featured?.numar_voturi || 0;
    const description = featuredDetails?.descriere || 'Titlul cu cel mai puternic semnal in platforma este pregatit pentru detalii, distributie si comentarii.';

    el('dash-feature').innerHTML = featured ? `
      <article class="vintage-feature" onclick="openFilmDetail(${featuredId})">
        <div class="vintage-poster">
          ${poster
            ? `<img src="${escHtml(poster)}" alt="${escHtml(title)}" onerror="this.parentElement.innerHTML='<div class=\\'film-poster-placeholder\\'><i class=\\'ti ti-movie\\'></i></div>'">`
            : `<div class="film-poster-placeholder"><i class="ti ti-movie"></i></div>`}
        </div>
        <div class="vintage-feature-copy">
          <div class="vintage-tags">
            <span>${escHtml(category)}</span>
            <span>${votes} voturi</span>
          </div>
          <h2>${escHtml(title)}</h2>
          <div class="vintage-score">
            <i class="ti ti-star-filled"></i>
            <strong>${fmtRating(rating)}</strong>
            <span>/10</span>
          </div>
          <p>${escHtml(description)}</p>
          <div class="vintage-actions">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openFilmDetail(${featuredId})">
              <i class="ti ti-eye"></i>
              Detalii film
            </button>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();navigate('top')">
              <i class="ti ti-trophy"></i>
              Top complet
            </button>
          </div>
        </div>
      </article>
    ` : emptyState('movie-off', 'Nu exista inca un film principal.');

    el('dash-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon yellow"><i class="ti ti-movie"></i></div>
        <div class="stat-value">${filmeActive}</div>
        <div class="stat-label">Filme active</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange"><i class="ti ti-users"></i></div>
        <div class="stat-value">${clientiActivi}</div>
        <div class="stat-label">Clienti activi</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green"><i class="ti ti-eye"></i></div>
        <div class="stat-value">${vizualizari}</div>
        <div class="stat-label">Vizualizari totale</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue"><i class="ti ti-message"></i></div>
        <div class="stat-value">${comentarii}</div>
        <div class="stat-label">Comentarii</div>
      </div>
    `;

    el('dash-top-filme').innerHTML = `
      <div class="vintage-list">
        ${(top || []).map((film, index) => {
          const idFilm = film.idFilm || film.id_film || film.id;
          const pct = (parseFloat(film.rating || 0) / 10 * 100).toFixed(1);

          return `
            <div class="vintage-list-row" onclick="openFilmDetail(${idFilm})">
              <span>${String(index + 1).padStart(2, '0')}</span>
              <strong title="${escHtml(film.titlu)}">${escHtml(film.titlu)}</strong>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
              <em>${fmtRating(film.rating)}</em>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const getSentNr = item => parseInt(item.numar_comentarii || item.numarComentarii || item.numar || 0);
    const totalSentimente = sentimente.reduce((sum, item) => sum + getSentNr(item), 0);

    el('dash-sentimente').innerHTML = `
      <div class="vintage-sentiments">
        ${sentimente.map(item => {
          const nr = getSentNr(item);
          const pct = totalSentimente ? ((nr / totalSentimente) * 100).toFixed(0) : '0';
          const sentiment = String(item.sentiment || 'neutru').toLowerCase();

          return `
            <div class="vintage-sentiment ${sentiment}">
              <i class="ti ${sentiment === 'pozitiv' ? 'ti-mood-smile' : sentiment === 'negativ' ? 'ti-mood-sad' : 'ti-mood-neutral'}"></i>
              <span>${escHtml(sentiment)}</span>
              <strong>${pct}%</strong>
              <small>${nr} reactii</small>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const getClientName = item => item.client || item.nume_complet || item.numeComplet || 'Client';
    const getClientViz = item => parseInt(item.numar_vizualizari || item.numarVizualizari || 0);
    const maxViz = Math.max(...topClienti.map(getClientViz), 1);

    el('dash-top-clienti').innerHTML = `
      <div class="vintage-client-grid">
        ${topClienti.map(client => {
          const name = getClientName(client);
          const viz = getClientViz(client);
          const pct = (viz / maxViz * 100).toFixed(1);

          return `
            <div class="vintage-client-card">
              <div class="client-avatar-sm">${initials(name)}</div>
              <div>
                <strong>${escHtml(name)}</strong>
                <span>${viz} vizualizari</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const getComentarii = item =>
      parseInt(item.total_comentarii || item.totalComentarii || item.numar_comentarii || item.numarComentarii || 0);
    const maxComentarii = Math.max(...comentate.map(getComentarii), 1);

    el('dash-comentate').innerHTML = `
      <div class="vintage-list">
        ${comentate.map((film, index) => {
          const nr = getComentarii(film);
          const pct = (nr / maxComentarii * 100).toFixed(1);

          return `
            <div class="vintage-list-row">
              <span>${index + 1}</span>
              <strong title="${escHtml(film.titlu)}">${escHtml(film.titlu)}</strong>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--cyan)"></div></div>
              <em>${nr}</em>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    const errHtml = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;

    ['dash-feature', 'dash-stats', 'dash-top-filme', 'dash-sentimente', 'dash-top-clienti', 'dash-comentate'].forEach(id => {
      const target = el(id);
      if (target) target.innerHTML = errHtml;
    });
  }
}
