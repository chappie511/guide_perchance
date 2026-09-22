window.APP_VERSION = 'v1.4.5';

function injecterMaVersion() {
  const el = document.getElementById('app-version');
  if (el) {
    el.textContent = window.APP_VERSION;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injecterMaVersion);
} else {
  injecterMaVersion();
}
