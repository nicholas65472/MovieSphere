async function renderProfil() {
  const cont = el('page-profil');

  if (!state.user) {
    cont.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>PROFILUL MEU</h1>
        </div>
      </div>

      <div class="alert alert-info">
        <i class="ti ti-info-circle"></i>
        Trebuie să fii autentificat.
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
        <h1>PROFILUL MEU</h1>
      </div>
    </div>

    <div class="content-grid-2">
      <div>
        <div class="card" style="margin-bottom:20px">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
              <div class="user-avatar" style="width:60px;height:60px;font-size:22px">
                ${initials(`${state.user.prenume || ''} ${state.user.nume || ''}`)}
              </div>

              <div>
                <div style="font-family:var(--font-display);font-size:24px;letter-spacing:.5px">
                  ${escHtml(state.user.prenume || '')} ${escHtml(state.user.nume || '')}
                </div>

                <div style="font-size:14px;color:var(--text3)">
                  ${escHtml(state.user.email || '')}
                </div>

                ${state.user.oras ? `
                  <div style="font-size:13px;color:var(--text2)">
                    ${escHtml(state.user.oras)}
                  </div>
                ` : ''}
              </div>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="navigate('recomandari')">
                <i class="ti ti-stars"></i>
                Recomandări
              </button>

              <button class="btn btn-secondary" onclick="openVizualizareModal()">
                <i class="ti ti-plus"></i>
                Adaugă vizualizare
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">CATEGORII PREFERATE</span>
          </div>
          <div class="card-body" id="profil-categorii">${loading()}</div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <span class="card-title">ACTORI URMĂRIȚI FRECVENT</span>
          </div>
          <div class="card-body" id="profil-actori">${loading()}</div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">CLIENȚI CU GUSTURI SIMILARE</span>
          </div>
          <div class="card-body" id="profil-similari">${loading()}</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-header">
        <span class="card-title">ISTORICUL MEU</span>
      </div>
      <div class="table-wrap" id="profil-istoric">${loading()}</div>
    </div>
  `;

  try {
    const [profil, actori, similari, istoric] = await Promise.all([
      API.clienti.profil(state.user.id),
      API.clienti.actoriFrecventi(state.user.id, 5),
      API.clienti.similari(state.user.id, 3),
      API.clienti.istoric(state.user.id),
    ]);

    el('profil-categorii').innerHTML = renderClientProfilCategorii(profil);
    el('profil-actori').innerHTML = renderProfilActori(actori);
    el('profil-similari').innerHTML = renderProfilSimilari(similari);
    el('profil-istoric').innerHTML = renderProfilIstoric(istoric);
  } catch (error) {
    ['profil-categorii', 'profil-actori', 'profil-similari', 'profil-istoric'].forEach(id => {
      const target = el(id);
      if (target) {
        target.innerHTML = `
          <div class="alert alert-danger" style="margin:8px">
            <i class="ti ti-alert-circle"></i>
            ${escHtml(error.message)}
          </div>
        `;
      }
    });
  }
}

function renderProfilActori(actori) {
  if (!actori?.length) {
    return emptyState('user-off', 'Niciun actor.');
  }

  return actori.map(actor => {
    const nume = actor.numeScena || actor.nume_scena || '—';
    const aparitii = actor.numarAparitii || actor.numar_aparitii || 0;
    const rol = actor.tipRolFrecvent || actor.tip_rol_frecvent || '—';

    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div class="actor-avatar" style="width:36px;height:36px;font-size:14px;flex-shrink:0">
          ${initials(nume)}
        </div>

        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">${escHtml(nume)}</div>
          <div style="font-size:11px;color:var(--text3)">${aparitii} apariții</div>
        </div>

        <span class="badge badge-${rol === 'Principal' ? 'yellow' : 'neutru'}" style="font-size:11px">
          ${escHtml(rol)}
        </span>
      </div>
    `;
  }).join('');
}

function renderProfilSimilari(similari) {
  if (!similari?.length) {
    return emptyState('users-off', 'Niciun client similar.');
  }

  return similari.map(client => {
    const name = client.numeComplet || client.nume_complet || '—';
    const scor = parseFloat(client.scorSimilaritate || client.scor_similaritate || 0).toFixed(0);

    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div class="client-avatar-sm">${initials(name)}</div>

        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">${escHtml(name)}</div>
          <div style="font-size:11px;color:var(--text3)">${escHtml(client.oras || '—')}</div>
        </div>

        <span style="font-family:var(--font-display);font-size:20px;color:var(--accent)">
          ${scor}
        </span>
      </div>
    `;
  }).join('');
}

function renderProfilIstoric(istoric) {
  if (!istoric?.length) {
    return emptyState('history-off', 'Nicio vizualizare.');
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Film</th>
          <th>Categorie</th>
          <th>Data</th>
          <th>Vot</th>
          <th>Sentiment</th>
        </tr>
      </thead>
      <tbody>
        ${istoric.slice(0, 20).map(item => {
          const idFilm = item.idFilm || item.id_film;

          return `
            <tr>
              <td style="font-size:13px;font-weight:500;cursor:pointer;color:var(--accent)" onclick="openFilmDetail(${idFilm})">
                ${escHtml(item.titlu)}
              </td>

              <td>
                <span class="badge badge-blue" style="font-size:11px">${escHtml(item.categorie)}</span>
              </td>

              <td style="font-size:12px;color:var(--text2)">
                ${fmtDate(item.dataVizualizare || item.data_vizualizare)}
              </td>

              <td>
                ${item.vot
                  ? `<span style="color:var(--accent);font-weight:500">${item.vot}/10</span>`
                  : '<span style="color:var(--text3)">—</span>'}
              </td>

              <td>
                ${sentimentBadge(item.sentiment) || '<span style="color:var(--text3);font-size:12px">—</span>'}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}
