async function renderTop() {
  const cont = el('page-top');
  let categorii = [];

  try {
    categorii = await API.categorii.getAll();
  } catch {
    categorii = [];
  }

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>TOP FILME</h1>
        <p>Clasament după rating și voturi</p>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="form-input" id="top-cat" style="width:160px">
          <option value="">Toate categoriile</option>
          ${categorii.map(categorie => `
            <option value="${categorie.id}">${escHtml(categorie.nume)}</option>
          `).join('')}
        </select>

        <select class="form-input" id="top-numar" style="width:80px">
          <option value="10" selected>10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>

        <button class="btn btn-primary" onclick="loadTop()">
          <i class="ti ti-trophy"></i>
          Actualizează
        </button>
      </div>
    </div>

    <div id="top-results">${loading()}</div>
  `;

  el('top-cat')?.addEventListener('change', loadTop);
  el('top-numar')?.addEventListener('change', loadTop);

  loadTop();
}

async function loadTop() {
  const categorie = el('top-cat')?.value || '';
  const numar = el('top-numar')?.value || 10;
  const res = el('top-results');

  if (!res) return;

  res.innerHTML = loading();

  try {
    const top = await API.filme.top(categorie || null, numar);

    if (!top?.length) {
      res.innerHTML = emptyState('trophy-off', 'Niciun film.');
      return;
    }

    res.innerHTML = `
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Film</th>
                <th>Categorie</th>
                <th>Rating</th>
                <th>Voturi</th>
                <th>Vizualizări</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              ${top.map((film, index) => {
                const idFilm = film.idFilm || film.id_film;
                const numarVoturi = film.numarVoturi || film.numar_voturi || 0;
                const numarVizualizari = film.numarVizualizari || film.numar_vizualizari || 0;

                return `
                  <tr>
                    <td style="font-family:var(--font-display);font-size:20px;color:${index < 3 ? 'var(--accent)' : 'var(--text3)'};">
                      ${index + 1}
                    </td>

                    <td style="font-size:14px;font-weight:500;min-width:180px">
                      ${escHtml(film.titlu)}
                    </td>

                    <td>
                      <span class="badge badge-blue" style="font-size:11px">
                        ${escHtml(film.categorie)}
                      </span>
                    </td>

                    <td>
                      <span style="font-family:var(--font-display);font-size:20px;color:var(--accent)">
                        ${fmtRating(film.rating)}
                      </span>
                    </td>

                    <td style="font-size:13px;color:var(--text2)">
                      ${numarVoturi}
                    </td>

                    <td style="font-size:13px;color:var(--text2)">
                      ${numarVizualizari}
                    </td>

                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="openFilmDetail(${idFilm})">
                        <i class="ti ti-eye"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (error) {
    res.innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }
}

/* ── RENDER PAGE ROUTER ── */
