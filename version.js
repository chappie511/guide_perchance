// version.js
const APP_VERSION = "guide-perchance-v1.2.0";

function updateVersionUI() {
  const versionElement = document.getElementById("app-version");
  if (versionElement) {
    versionElement.textContent = APP_VERSION;
  }
}

// Exécution au chargement du DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateVersionUI);
} else {
  updateVersionUI();
}
