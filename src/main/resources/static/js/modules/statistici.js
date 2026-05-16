async function renderStatistici() {
  const cont = el('page-statistici');

  cont.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>STATISTICI</h1>
        <p>Analize și rapoarte platformă</p>
      </div>
    </div>

    <div class="tabs" id="stat-tabs-wrap">
      <button class="tab-btn active" data-tab="tab-stat-general">General</button>
      <button class="tab-btn" data-tab="tab-stat-optiuni">Opțiuni bifate</button>
      <button class="tab-btn" data-tab="tab-stat-audit">Audit log</button>
    </div>

    <div class="tab-panel active" id="tab-stat-general">
      <div class="content-grid-2">
        <div class="card">
          <div class="card-header">
            <span class="card-title">DISTRIBUȚIE SENTIMENT</span>
          </div>
          <div class="card-body" id="stat-sent">${loading()}</div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">TOP CLIENȚI ACTIVI</span>
          </div>
          <div class="card-body" id="stat-top-cl">${loading()}</div>
        </div>
      </div>

      <div style="margin-top:20px" class="card">
        <div class="card-header">
          <span class="card-title">FILME CEL MAI COMENTATE</span>
        </div>
        <div class="card-body" id="stat-comentate">${loading()}</div>
      </div>
    </div>

    <div class="tab-panel" id="tab-stat-optiuni">
      <div class="card">
        <div class="card-header">
          <span class="card-title">TOP OPȚIUNI BIFATE</span>
        </div>
        <div class="card-body" id="stat-optiuni">${loading()}</div>
      </div>
    </div>

    <div class="tab-panel" id="tab-stat-audit">
      <div class="card">
        <div class="card-header">
          <span class="card-title">AUDIT LOG</span>
          <select class="form-input" id="audit-limit" style="width:100px">
            <option value="25">25</option>
            <option value="50" selected>50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div class="table-wrap" id="stat-audit">${loading()}</div>
      </div>
    </div>
  `;

  initTabs(el('stat-tabs-wrap')?.parentElement);

  el('audit-limit')?.addEventListener('change', loadAudit);

  loadStatistici();
}

function getSentimentCount(item) {
  return parseInt(item.numar_comentarii || item.numarComentarii || item.numar || 0);
}

function getClientName(item) {
  return item.client || item.nume_complet || item.numeComplet || 'Client';
}

function getClientVizualizari(item) {
  return parseInt(item.numar_vizualizari || item.numarVizualizari || 0);
}

function getComentariiCount(item) {
  return parseInt(
    item.total_comentarii ||
    item.totalComentarii ||
    item.numar_comentarii ||
    item.numarComentarii ||
    0
  );
}

function getOptiuniCount(item) {
  return parseInt(item.de_cate_ori_bifata || item.deCateOriBifata || item.numar || 0);
}

async function loadStatistici() {
  try {
    const [sentimente, topClienti, filmeComentate] = await Promise.all([
      API.statistici.sentimente(),
      API.statistici.topClienti(10),
      API.statistici.filmeComentate(10),
    ]);

    const colors = {
      pozitiv: '#4caf7d',
      negativ: '#e05252',
      neutru: '#9a9898',
    };

    const total = sentimente.reduce((sum, item) => sum + getSentimentCount(item), 0);

    el('stat-sent').innerHTML = `
      <div class="donut-wrap">
        <svg width="130" height="130" viewBox="0 0 120 120">
          ${buildDonut(sentimente, total, colors)}
        </svg>

        <div class="donut-legend">
          ${sentimente.map(item => {
            const count = getSentimentCount(item);
            const pct = total ? ((count / total) * 100).toFixed(1) : '0.0';

            return `
              <div class="legend-item">
                <div class="legend-dot" style="background:${colors[item.sentiment] || '#888'}"></div>
                <span>${escHtml(item.sentiment || '—')}</span>
                <span style="color:var(--text3);margin-left:4px">${pct}% (${count})</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const maxClienti = Math.max(...topClienti.map(getClientVizualizari), 1);

    el('stat-top-cl').innerHTML = `
      <div class="bar-chart">
        ${topClienti.map(client => {
          const name = getClientName(client);
          const value = getClientVizualizari(client);
          const width = (value / maxClienti * 100).toFixed(1);

          return `
            <div class="bar-row">
              <div class="bar-label" title="${escHtml(name)}">${escHtml(name)}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%;background:var(--accent2)"></div>
              </div>
              <div class="bar-val">${value}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const maxComentarii = Math.max(...filmeComentate.map(getComentariiCount), 1);

    el('stat-comentate').innerHTML = `
      <div class="bar-chart">
        ${filmeComentate.map(film => {
          const value = getComentariiCount(film);
          const width = (value / maxComentarii * 100).toFixed(1);

          return `
            <div class="bar-row">
              <div class="bar-label" title="${escHtml(film.titlu)}">${escHtml(film.titlu)}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%;background:#6495ed"></div>
              </div>
              <div class="bar-val">${value}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    ['stat-sent', 'stat-top-cl', 'stat-comentate'].forEach(id => {
      const target = el(id);
      if (target) {
        target.innerHTML = `
          <div class="alert alert-danger">
            <i class="ti ti-alert-circle"></i>
            ${escHtml(error.message)}
          </div>
        `;
      }
    });
  }

  try {
    const optiuni = await API.statistici.optiuniBifate();
    const maxOptiuni = Math.max(...optiuni.map(getOptiuniCount), 1);

    el('stat-optiuni').innerHTML = `
      <div class="bar-chart">
        ${optiuni.map(option => {
          const value = getOptiuniCount(option);
          const width = (value / maxOptiuni * 100).toFixed(1);
          const label = option.eticheta || option.cod || 'Opțiune';

          return `
            <div class="bar-row">
              <div class="bar-label" title="${escHtml(label)}">${escHtml(label)}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%;background:var(--success)"></div>
              </div>
              <div class="bar-val">${value}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    const target = el('stat-optiuni');
    if (target) {
      target.innerHTML = `
        <div class="alert alert-danger">
          <i class="ti ti-alert-circle"></i>
          ${escHtml(error.message)}
        </div>
      `;
    }
  }

  loadAudit();
}

async function loadAudit() {
  const limit = el('audit-limit')?.value || 50;
  const wrap = el('stat-audit');

  if (!wrap) return;

  wrap.innerHTML = loading();

  try {
    const audit = await API.statistici.audit(limit);
    const opMap = {
      INSERT: 'badge-pozitiv',
      UPDATE: 'badge-yellow',
      DELETE: 'badge-negativ',
    };

    if (!audit?.length) {
      wrap.innerHTML = emptyState('list-off', 'Nu există operații în audit log.');
      return;
    }

    wrap.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Tabel</th>
            <th>Operație</th>
            <th>ID Rând</th>
            <th>Detalii</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${audit.map(item => `
            <tr>
              <td style="color:var(--text3);font-size:12px">${item.id}</td>
              <td>
                <span class="badge badge-blue" style="font-size:11px">
                  ${escHtml(item.tabelNume || item.tabel_nume)}
                </span>
              </td>
              <td>
                <span class="badge ${opMap[item.operatie] || 'badge-neutru'}" style="font-size:11px">
                  ${escHtml(item.operatie)}
                </span>
              </td>
              <td style="color:var(--text2);font-size:13px">
                ${item.idRand || item.id_rand || '—'}
              </td>
              <td style="font-size:12px;color:var(--text2);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                ${escHtml(item.detalii || '')}
              </td>
              <td style="font-size:12px;color:var(--text3)">
                ${fmtDateTime(item.dataOp || item.data_op)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    wrap.innerHTML = `
      <div class="alert alert-danger" style="margin:16px">
        <i class="ti ti-alert-circle"></i>
        ${escHtml(error.message)}
      </div>
    `;
  }
}
