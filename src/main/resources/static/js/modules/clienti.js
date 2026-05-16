async function renderClienti() {
  const cont = el('page-clienti');

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>CLIENȚI</h1>
        <p>Toți utilizatorii înregistrați</p>
      </div>
      <div style="display:flex;gap:10px">
        <input class="form-input" id="search-clienti" placeholder="Caută client..." style="width:220px">
      </div>
    </div>

    <div class="card">
      <div class="table-wrap" id="clienti-table">${loading()}</div>
    </div>
  `;

  let clienti = [];

  try {
    clienti = await API.clienti.getAll();
    renderClientiTable(clienti);
  } catch (error) {
    el('clienti-table').innerHTML = `
      <div class="alert alert-danger" style="margin:16px">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }

  el('search-clienti')?.addEventListener('input', event => {
    const query = event.target.value.toLowerCase();

    const filtered = clienti.filter(client => {
      const name = getClientDisplayName(client).toLowerCase();
      const email = String(client.email || '').toLowerCase();
      const oras = String(client.oras || '').toLowerCase();

      return name.includes(query) || email.includes(query) || oras.includes(query);
    });

    renderClientiTable(filtered);
  });
}

function getClientDisplayName(client) {
  return (
    client.numeComplet ||
    client.nume_complet ||
    client.client ||
    `${client.prenume || ''} ${client.nume || ''}`.trim() ||
    'Client'
  );
}

function renderClientiTable(clienti) {
  const wrap = el('clienti-table');
  if (!wrap) return;

  if (!clienti?.length) {
    wrap.innerHTML = emptyState('users-off', 'Niciun client găsit.');
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Client</th>
          <th>Email</th>
          <th>Oraș</th>
          <th>Înregistrat</th>
          <th>Status</th>
          <th>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        ${clienti.map(client => {
          const name = getClientDisplayName(client);
          const activ = client.activ !== false && client.activ !== 0;

          return `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="client-avatar-sm">${initials(name)}</div>
                  <div>
                    <div style="font-size:14px;font-weight:500">${escHtml(name)}</div>
                    ${client.telefon ? `<div style="font-size:12px;color:var(--text3)">${escHtml(client.telefon)}</div>` : ''}
                  </div>
                </div>
              </td>
              <td style="color:var(--text2);font-size:13px">${escHtml(client.email || '—')}</td>
              <td style="font-size:13px">${escHtml(client.oras || '—')}</td>
              <td style="font-size:13px;color:var(--text2)">${fmtDate(client.dataInregistrare || client.data_inregistrare)}</td>
              <td>
                <span class="badge badge-${activ ? 'pozitiv' : 'negativ'}">
                  ${activ ? 'Activ' : 'Inactiv'}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-secondary btn-sm" onclick="openClientDetail(${client.id})" title="Detalii">
                    <i class="ti ti-eye"></i>
                  </button>

                  ${activ ? `
                    <button class="btn btn-danger btn-sm" onclick="dezactiveazaClient(${client.id}, '${escHtml(name)}')" title="Dezactivează">
                      <i class="ti ti-user-off"></i>
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function openClientDetail(id) {
  const modal = el('modal-client');
  const body = el('modal-client-body');

  if (!modal || !body) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  body.innerHTML = loading('Se încarcă profilul clientului...');

  try {
    const [profil, istoric, actori, similari] = await Promise.all([
      API.clienti.profil(id),
      API.clienti.istoric(id),
      API.clienti.actoriFrecventi(id, 5),
      API.clienti.similari(id, 3),
    ]);

    body.innerHTML = `
      <div class="tabs" id="client-tabs-wrap">
        <button class="tab-btn active" data-tab="tab-cl-profil">Profil categorii</button>
        <button class="tab-btn" data-tab="tab-cl-istoric">Istoric (${istoric.length})</button>
        <button class="tab-btn" data-tab="tab-cl-actori">Actori frecvenți</button>
        <button class="tab-btn" data-tab="tab-cl-similari">Clienți similari</button>
      </div>

      <div class="tab-panel active" id="tab-cl-profil">
        ${renderClientProfilCategorii(profil)}
      </div>

      <div class="tab-panel" id="tab-cl-istoric">
        ${renderClientIstoric(istoric)}
      </div>

      <div class="tab-panel" id="tab-cl-actori">
        ${renderClientActori(actori)}
      </div>

      <div class="tab-panel" id="tab-cl-similari">
        ${renderClientiSimilari(similari)}
      </div>
    `;

    initTabs(el('client-tabs-wrap')?.parentElement);
  } catch (error) {
    body.innerHTML = `
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }
}

function renderClientProfilCategorii(profil) {
  if (!profil?.length) {
    return emptyState('chart-off', 'Nicio vizualizare înregistrată.');
  }

  return `
    <div class="bar-chart">
      ${profil.map(item => {
        const procent = parseFloat(item.procent || 0).toFixed(1);
        const viz = item.numarVizualizari || item.numar_vizualizari || 0;
        const rating = item.ratingMediu || item.rating_mediu;

        return `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
              <span>${escHtml(item.categorie)}</span>
              <span style="color:var(--text3)">
                ${viz} vizionări · ${fmtRating(rating)}/10 · ${procent}%
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${procent}%"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderClientIstoric(istoric) {
  if (!istoric?.length) {
    return emptyState('history-off', 'Nicio vizualizare.');
  }

  return `
    <div class="table-wrap">
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
          ${istoric.map(item => `
            <tr>
              <td style="font-size:13px;font-weight:500">${escHtml(item.titlu)}</td>
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
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderClientActori(actori) {
  if (!actori?.length) {
    return emptyState('user-off', 'Niciun actor.');
  }

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${actori.map((actor, index) => {
        const nume = actor.numeScena || actor.nume_scena || '—';
        const aparitii = actor.numarAparitii || actor.numar_aparitii || 0;
        const rating = actor.ratingMediu || actor.rating_mediu;
        const rol = actor.tipRolFrecvent || actor.tip_rol_frecvent || '—';

        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg3);border-radius:var(--radius)">
            <div style="font-family:var(--font-display);font-size:22px;color:var(--text3);width:28px;text-align:center">
              ${index + 1}
            </div>

            <div class="actor-avatar" style="width:40px;height:40px;font-size:16px;flex-shrink:0">
              ${initials(nume)}
            </div>

            <div style="flex:1">
              <div style="font-size:14px;font-weight:500">${escHtml(nume)}</div>
              <div style="font-size:12px;color:var(--text3)">
                ${escHtml(actor.nationalitate || '—')} · Rol frecvent: ${escHtml(rol)}
              </div>
            </div>

            <div style="text-align:right">
              <div style="font-size:13px;color:var(--accent)">${aparitii} apariții</div>
              <div style="font-size:12px;color:var(--text3)">${fmtRating(rating)}/10</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderClientiSimilari(similari) {
  if (!similari?.length) {
    return emptyState('users-off', 'Niciun client similar.');
  }

  return similari.map(client => {
    const name = client.numeComplet || client.nume_complet || '—';
    const scor = parseFloat(client.scorSimilaritate || client.scor_similaritate || 0).toFixed(1);

    return `
      <div style="background:var(--bg3);border-radius:var(--radius);padding:14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="client-avatar-sm">${initials(name)}</div>
            <div>
              <div style="font-size:14px;font-weight:500">${escHtml(name)}</div>
              <div style="font-size:12px;color:var(--text3)">${escHtml(client.oras || '—')}</div>
            </div>
          </div>

          <div style="text-align:right">
            <div style="font-family:var(--font-display);font-size:24px;color:var(--accent)">${scor}</div>
            <div style="font-size:11px;color:var(--text3)">scor</div>
          </div>
        </div>

        <div style="font-size:12px;color:var(--text3);line-height:1.5">
          ${escHtml(client.motiv || '')}
        </div>
      </div>
    `;
  }).join('');
}

async function dezactiveazaClient(id, name) {
  if (!confirm(`Sigur vrei să dezactivezi clientul "${name}"?`)) return;

  try {
    await API.clienti.dezactiveaza(id);
    showToast(`Clientul ${name} a fost dezactivat.`, 'success');
    renderClienti();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
