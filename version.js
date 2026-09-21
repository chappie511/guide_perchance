// 1. Tu inventes le nom de la constante globale
const APP_VERSION = 'v1.4.0';
console.log(`Version : ${APP_VERSION}`);

// 2. Tu inventes le nom de la fonction
function injecterMaVersion() {
  // Tu inventes le nom de la variable locale (ex: monElement)
  const monElement =  document.getElementById('app-version');
  
  if (monElement) {
    monElement.textContent = APP_VERSION;
  }
}

// 3. Gestion du chargement (Les mots en bleu sont FIXES et imposés par JavaScript)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injecterMaVersion);
} else {
  injecterMaVersion();
}
