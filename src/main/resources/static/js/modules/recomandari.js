async function renderRecomandari() {
  const cont = el('page-recomandari');

  if (!state.user) {
    cont.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>RECOMANDĂRI</h1>
        </div>
      </div>

      <div class="alert alert-info">
        <i class="ti ti-info-circle"></i>
        Trebuie să fii autentificat pentru a vedea recomandări personalizate.
        <a href="#" onclick="openModal('modal-login');return false;" style="color:var(--accent);margin-left:8px">
          Autentifică-te →
        </a>
      </div>
    `;
    return;
  }

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>RECOMANDĂRI</h1>
        <p>Filme recomandate pentru tine</p>
      </div>

      <div style="display:flex;gap:10px;align-items:center">
        <label style="font-size:13px;color:var(--text2)">Număr:</label>
        <select class="form-input" id="rec-numar" style="width:80px">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="20">20</option>
        </select>

        <button class="btn btn-primary" onclick="loadRecomandari()">
          <i class="ti ti-refresh"></i>
          Regenerează
        </button>
      </div>
    </div>

    <div id="rec-grid">${loading('Se generează recomandări...')}</div>
  `;

  el('rec-numar')?.addEventListener('change', loadRecomandari);
  loadRecomandari();
}

async function loadRecomandari() {
  const numar = el('rec-numar')?.value || 10;
  const grid = el('rec-grid');

  if (!grid || !state.user) return;

  grid.innerHTML = loading('Se generează recomandări...');

  try {
    const istoric = await API.clienti.istoric(state.user.id);

    if (!istoric?.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-history-off"></i>
          <p>Nu ai suficiente vizualizari pentru recomandari personalizate.</p>
          <p style="margin-top:6px;color:var(--text3)">
            Adauga cateva vizualizari, iar apoi recomandarile vor fi generate pe baza istoricului tau.
          </p>
          <button class="btn btn-primary btn-sm" style="margin-top:18px" onclick="navigate('filme')">
            <i class="ti ti-movie"></i>
            Alege filme
          </button>
        </div>
      `;
      return;
    }

    const recomandari = await API.filme.recomandari(state.user.id, numar);

    if (!recomandari?.length) {
      grid.innerHTML = emptyState('stars-off', 'Nu sunt recomandări disponibile.');
      return;
    }

    grid.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        ${recomandari.map((item, index) => {
          const idFilm = item.idFilm || item.id_film;
          const scor = parseFloat(item.scorFinal || item.scor_final || 0).toFixed(1);

          return `
            <div class="rec-card" onclick="openFilmDetail(${idFilm})">
              <div style="font-family:var(--font-display);font-size:32px;color:var(--text3);width:36px;text-align:center;flex-shrink:0">
                ${index + 1}
              </div>

              <div class="rec-poster">
                <div class="film-poster-placeholder" style="height:100%;border-radius:8px">
                  <i class="ti ti-movie" style="font-size:20px;color:var(--text3)"></i>
                </div>
              </div>

              <div class="rec-body">
                <div class="rec-title">${escHtml(item.titlu)}</div>
                <div class="rec-category">${escHtml(item.categorie)}</div>

                <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
                  <div class="rec-score">${scor}</div>
                  <div class="rec-score-label">/ 100 scor potrivire</div>
                  <div style="margin-left:auto;color:var(--accent);font-size:13px">
                    <i class="ti ti-star-filled" style="font-size:12px"></i>
                    ${fmtRating(item.rating)}
                  </div>
                </div>

                <div style="font-size:12px;color:var(--text3);line-height:1.5">
                  ${escHtml(item.motiv || '')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    grid.innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }
}

/* ── PREDICTII ── */
