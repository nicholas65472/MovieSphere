const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    });

    if (res.status === 204) {
      return null;
    }

    let json = null;

    try {
      json = await res.json();
    } catch {
      if (!res.ok) {
        throw new Error(`Eroare ${res.status}`);
      }
      return null;
    }

    if (!res.ok || json.success === false) {
      throw new Error(json.mesaj || `Eroare ${res.status}`);
    }

    return json.data;
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error('Serverul nu este disponibil. Asigură-te că backend-ul rulează pe portul 8081.');
    }

    throw err;
  }
}

const API = {
  filme: {
    getAll: (q) => apiFetch(`/filme${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    getById: (id) => apiFetch(`/filme/${id}`),
    getVersiuni: (id) => apiFetch(`/filme/${id}/versiuni`),
    getDistributie: (id) => apiFetch(`/filme/${id}/distributie`),
    getComentarii: (id) => apiFetch(`/filme/${id}/comentarii`),
    top: (categorie, numar = 10) =>
      apiFetch(`/filme/top?numar=${numar}${categorie ? `&categorie=${categorie}` : ''}`),
    recomandari: (idClient, numar = 10) =>
      apiFetch(`/filme/recomandari/${idClient}?numar=${numar}`),
    statisticiSezoniere: (idFilm) =>
      apiFetch(`/filme/statistici/sezoniere${idFilm ? `?idFilm=${idFilm}` : ''}`),
    predictii: (sezon, numar = 10) =>
      apiFetch(`/filme/predictii?sezon=${encodeURIComponent(sezon)}&numar=${numar}`),
  },

  categorii: {
    getAll: () => apiFetch('/categorii'),
    getById: (id) => apiFetch(`/categorii/${id}`),
    getFilme: (id) => apiFetch(`/categorii/${id}/filme`),
    statistici: () => apiFetch('/categorii/statistici'),
  },

  actori: {
    getAll: () => apiFetch('/actori'),
    getById: (id) => apiFetch(`/actori/${id}`),
    getFilme: (id) => apiFetch(`/actori/${id}/filme`),
    getComentarii: (id) => apiFetch(`/actori/${id}/comentarii`),
  },

  clienti: {
    getAll: () => apiFetch('/clienti'),
    inregistrare: (data) =>
      apiFetch('/clienti/inregistrare', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data) =>
      apiFetch('/clienti/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    profil: (id) => apiFetch(`/clienti/${id}/profil`),
    istoric: (id) => apiFetch(`/clienti/${id}/istoric`),
    actoriFrecventi: (id, numar = 10) =>
      apiFetch(`/clienti/${id}/actori-frecventi?numar=${numar}`),
    similari: (id, numar = 5) =>
      apiFetch(`/clienti/${id}/similari?numar=${numar}`),
    dezactiveaza: (id) =>
      apiFetch(`/clienti/${id}`, {
        method: 'DELETE',
      }),
  },

  vizualizari: {
    add: (data) =>
      apiFetch('/vizualizari', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateVot: (data) =>
      apiFetch('/vizualizari/vot', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getClient: (idClient) => apiFetch(`/vizualizari/client/${idClient}`),
    finalizeaza: (id) =>
      apiFetch(`/vizualizari/${id}/finalizeaza`, {
        method: 'PUT',
      }),
  },

  comentarii: {
    add: (data) =>
      apiFetch('/comentarii', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    addActor: (data) => {
      const params = new URLSearchParams();

      params.append('idClient', data.idClient);
      params.append('idActor', data.idActor);
      if (data.idFilm !== undefined && data.idFilm !== null && data.idFilm !== '') {
        params.append('idFilm', data.idFilm);
      }
      params.append('continut', data.continut);

      return apiFetch(`/comentarii/actor?${params.toString()}`, {
        method: 'POST',
      });
    },

    optiuni: () => apiFetch('/comentarii/optiuni'),
    getClient: (idClient) => apiFetch(`/comentarii/client/${idClient}`),
  },

  statistici: {
    generale: () => apiFetch('/statistici'),
    sentimente: () => apiFetch('/statistici/sentimente'),
    topClienti: (limit = 10) => apiFetch(`/statistici/top-clienti?limit=${limit}`),
    evolutie: () => apiFetch('/statistici/evolutie'),
    filmeComentate: (limit = 10) => apiFetch(`/statistici/filme-comentate?limit=${limit}`),
    optiuniBifate: () => apiFetch('/statistici/optiuni-bifate'),
    audit: (limit = 50) => apiFetch(`/statistici/audit?limit=${limit}`),
  },

  health: () => apiFetch('/health'),
};
