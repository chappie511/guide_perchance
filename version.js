// version.js
const APP_VERSION = "guide-perchance-v1.1.9";

function updateVersionUI() {
  // Correction de l'ID pour correspondre à <span id="app-version"> du fichier HTML
  const versionElement = document.getElementById("app-version");
  if (versionElement) {
    versionElement.textContent = APP_VERSION;
  }
}

// Exécution dès que le DOM est prêt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateVersionUI);
} else {
  updateVersionUI();
}
