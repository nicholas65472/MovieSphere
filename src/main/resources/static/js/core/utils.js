/* ── DOM HELPERS ── */
function el(id) {
  return document.getElementById(id);
}

function qs(selector, context = document) {
  return context.querySelector(selector);
}

function qsa(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/* ── FORMAT HELPERS ── */
function escHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fmtDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return (
    date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' ' +
    date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

function fmtRating(value) {
  const number = parseFloat(value);
  return Number.isNaN(number) ? '—' : number.toFixed(2);
}

function initials(name) {
  const text = String(name || '?').trim();

  if (!text || text === '?') return '?';

  return text
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

function compactNumber(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('ro-RO', {
    notation: number >= 10000 ? 'compact' : 'standard',
  }).format(number);
}

/* ── UI HELPERS ── */
function loading(message = '') {
  return `
    <div class="loading-block">
      <div class="spinner"></div>
      <span>${escHtml(message || 'Se încarcă...')}</span>
    </div>
  `;
}

function emptyState(icon, message) {
  return `
    <div class="empty-state">
      <i class="ti ti-${escHtml(icon)}"></i>
      <p>${escHtml(message)}</p>
    </div>
  `;
}

function showToast(message, type = 'success') {
  const container = el('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="ti ti-${type === 'success' ? 'circle-check' : 'alert-circle'}"></i>
    <span>${escHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn .3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function sentimentBadge(sentiment) {
  if (!sentiment) return '';

  const normalized = String(sentiment).toLowerCase();

  const badgeClass = {
    pozitiv: 'pozitiv',
    negativ: 'negativ',
    neutru: 'neutru',
  }[normalized] || 'neutru';

  const icon = {
    pozitiv: 'mood-happy',
    negativ: 'mood-sad',
    neutru: 'mood-neutral',
  }[normalized] || 'mood-neutral';

  return `
    <span class="badge badge-${badgeClass}">
      <i class="ti ti-${icon}"></i>
      ${escHtml(sentiment)}
    </span>
  `;
}

function starHtml(rating, max = 10) {
  const number = parseFloat(rating);
  const filled = Number.isNaN(number)
    ? 0
    : Math.round((number / max) * 5);

  return Array.from({ length: 5 }, (_, index) => {
    const active = index < filled;

    return `
      <i class="ti ti-star${active ? '-filled' : ''}"
         style="color:${active ? 'var(--accent)' : 'var(--text3)'}; font-size:14px;"></i>
    `;
  }).join('');
}

function posterImg(url, alt, className = '') {
  if (url) {
    return `
      <img src="${escHtml(url)}"
           alt="${escHtml(alt)}"
           loading="lazy"
           ${className ? `class="${escHtml(className)}"` : ''}
           onerror="this.parentElement.innerHTML='<div class=\\'film-poster-placeholder\\'><i class=\\'ti ti-movie\\'></i></div>'">
    `;
  }

  return `
    <div class="film-poster-placeholder">
      <i class="ti ti-movie"></i>
    </div>
  `;
}

function seasonIcon(season) {
  const map = {
    Iarna: 'snowflake',
    Primavara: 'plant',
    Vara: 'sun',
    Toamna: 'leaf',
  };

  return map[season] || 'calendar';
}

function buildDonut(items, total, colors = {}) {
  const radius = 44;
  const center = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!items?.length || !total) {
    return `
      <circle cx="${center}" cy="${center}" r="${radius}"
              fill="none"
              stroke="rgba(224,188,119,.18)"
              stroke-width="${strokeWidth}"></circle>
    `;
  }

  return items.map(item => {
    const sentiment = String(item.sentiment || '').toLowerCase();
    const count = parseInt(item.numar_comentarii || item.numarComentarii || item.numar || 0);
    const segment = count / total * circumference;
    const dash = `${segment} ${circumference - segment}`;
    const color = colors[sentiment] || colors[item.sentiment] || '#888';
    const circle = `
      <circle cx="${center}" cy="${center}" r="${radius}"
              fill="none"
              stroke="${escHtml(color)}"
              stroke-width="${strokeWidth}"
              stroke-dasharray="${dash}"
              stroke-dashoffset="${-offset}"
              stroke-linecap="round"
              transform="rotate(-90 ${center} ${center})"></circle>
    `;

    offset += segment;
    return circle;
  }).join('');
}
