function renderPage(page, params = {}) {
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;

    case 'filme':
      renderFilme(params);
      break;

    case 'actori':
      renderActori();
      break;

    case 'clienti':
      renderClienti();
      break;

    case 'statistici':
      renderStatistici();
      break;

    case 'recomandari':
      renderRecomandari();
      break;

    case 'predictii':
      renderPredictii();
      break;

    case 'profil':
      renderProfil();
      break;

    case 'top':
      renderTop();
      break;

    default:
      navigate('dashboard');
      break;
  }
}
