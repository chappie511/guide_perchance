const APP_VERSION = 'v1.4.4';
console.log(`Version : ${APP_VERSION}`);

function injecterMaVersion() {
  const monElement = document.getElementById('app-version');
  if (monElement) {
    monElement.textContent = APP_VERSION;
  }
}

// S'exécute immédiatement si le DOM est déjà prêt, sinon attend le chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injecterMaVersion);
} else {
  injecterMaVersion();
}
