async function renderPredictii() {
  const cont = el('page-predictii');

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>PREDICȚII SEZONIERE</h1>
        <p>Estimări de vizualizare pe sezoane</p>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="form-input" id="pred-sezon" style="width:130px">
          <option value="Iarna">Iarnă</option>
          <option value="Primavara">Primăvară</option>
          <option value="Vara" selected>Vară</option>
          <option value="Toamna">Toamnă</option>
        </select>

        <select class="form-input" id="pred-numar" style="width:80px">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="20">20</option>
        </select>

        <button class="btn btn-primary" onclick="loadPredictii()">
          <i class="ti ti-search"></i>
          Analizează
        </button>
      </div>
    </div>

    <div id="pred-results">${loading()}</div>
  `;

  el('pred-sezon')?.addEventListener('change', loadPredictii);
  el('pred-numar')?.addEventListener('change', loadPredictii);

  loadPredictii();
}

async function loadPredictii() {
  const sezon = el('pred-sezon')?.value || 'Vara';
  const numar = el('pred-numar')?.value || 10;
  const res = el('pred-results');

  if (!res) return;

  res.innerHTML = loading('Se calculează predicțiile...');

  try {
    const predictii = await API.filme.predictii(sezon, numar);

    if (!predictii?.length) {
      res.innerHTML = emptyState('chart-off', 'Nu sunt predicții disponibile.');
      return;
    }

    res.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        ${predictii.map((item, index) => {
          const scor = parseFloat(item.scorPredictie || item.scor_predictie || 0).toFixed(1);
          const vizIstorice = item.vizIstoriceSezon || item.viz_istorice_sezon || 0;
          const tendinta = item.tendintaRecenta || item.tendinta_recenta || 0;

          return `
            <div class="card" style="padding:0;overflow:hidden">
              <div style="display:flex;align-items:stretch">
                <div style="width:6px;background:${seasonColor(sezon)};flex-shrink:0"></div>

                <div style="flex:1;padding:14px 16px;display:flex;gap:16px;align-items:center">
                  <div style="font-family:var(--font-display);font-size:28px;color:var(--text3);width:32px;text-align:center;flex-shrink:0">
                    ${index + 1}
                  </div>

                  <div style="flex:1;min-width:0">
                    <div style="font-size:15px;font-weight:500;margin-bottom:2px">
                      ${escHtml(item.titlu)}
                    </div>

                    <div style="font-size:12px;color:var(--text3);margin-bottom:8px">
                      ${escHtml(item.categorie)} · Rating: ${fmtRating(item.rating)}
                    </div>

                    <div style="display:flex;gap:16px;font-size:12px;flex-wrap:wrap">
                      <span style="color:var(--text2)">
                        <i class="ti ti-history" style="font-size:13px"></i>
                        Viz. istorice: <strong>${vizIstorice}</strong>
                      </span>

                      <span style="color:var(--text2)">
                        <i class="ti ti-trending-up" style="font-size:13px"></i>
                        Tendință: <strong>${tendinta}</strong>
                      </span>
                    </div>

                    <div style="font-size:11px;color:var(--text3);margin-top:6px">
                      ${escHtml(item.explicatie || '')}
                    </div>
                  </div>

                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-family:var(--font-display);font-size:30px;color:${seasonColor(sezon)}">
                      ${scor}
                    </div>
                    <div style="font-size:11px;color:var(--text3)">scor predicție</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
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

function seasonColor(season) {
  return {
    Iarna: '#6495ed',
    Primavara: '#4caf7d',
    Vara: '#e8c840',
    Toamna: '#ff6b35',
  }[season] || 'var(--accent)';
}

/* ── PROFIL ── */
