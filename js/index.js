// Fonction pour charger et injecter du HTML de manière dynamique
function chargerSection(idDeLaBoite, cheminDuFichier) {
    fetch(cheminDuFichier)
        .then(reponse => {
            if (!reponse.ok) {
                throw new Error("Erreur HTTP " + reponse.status + " pour " + cheminDuFichier);
            }
            return reponse.text();
        })
        .then(texteHtml => {
            const conteneur = document.getElementById(idDeLaBoite);
            if (conteneur) conteneur.innerHTML = texteHtml;
        })
        .catch(erreur => {
            console.error("Erreur de chargement :", erreur);
            const conteneur = document.getElementById(idDeLaBoite);
            if (conteneur) {
                conteneur.innerHTML = `<div style="padding:10px; color:#b91c1c;">⚠️ Impossible de charger cette section.</div>`;
            }
        });
}

// Charge automatiquement les 24 sections depuis le dossier sections_du_guide
for (let i = 1; i <= 24; i++) {
    const num = String(i).padStart(2, '0');
    chargerSection(`conteneur-section-${i}`, `./sections_du_guide/section_${num}.html`);
}

// Copie des prompts dans le presse-papiers
document.addEventListener('click', function (e) {
  let boite = e.target.closest('.prompt-box');
  
  if (boite) {
    let texte = boite.innerText;
    
    // Remplace le bloc alert() par un retour visuel direct
    navigator.clipboard.writeText(texte)
      .then(function() {
        const originalBg = boite.style.backgroundColor;
        boite.style.outline = "2px solid #22c55e";
        setTimeout(() => {
          boite.style.outline = "";
        }, 1200);
      });
  }
});

// Bouton retour vers le haut
(function () {
  var btn = document.getElementById('backToTopBtn');
  function onScroll() {
    if (window.scrollY > 1900) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  onScroll();
})();

// Gestionnaires d'événements pour l'ouverture et la fermeture des modales
document.addEventListener('click', function(event) {
  
  if (event.target && event.target.id === 'btnOuvrirPoses') {
    document.getElementById('modalPoses').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (event.target && event.target.id === 'btnOuvrirVues') {
    document.getElementById('modalVues').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  if (event.target && event.target.id === 'btnOuvrirSec18') {
    document.getElementById('modalSec18').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  if (event.target && event.target.id === 'btnOuvrirStyles') {
    document.getElementById('modalStyles').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  if (event.target && event.target.id === 'btnOuvrirPerspectives') {
    document.getElementById('modalPerspectives').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  if (event.target && event.target.id === 'btnOuvrirEclairages') {
    document.getElementById('modalEclairages').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Fermeture des modales
  if (event.target && (event.target.classList.contains('btn-close-menu') || event.target.classList.contains('quick-nav-btn'))) {
    const modalActif = event.target.closest('.modal-overlay');
    if (modalActif) {
      modalActif.classList.remove('active');
      document.body.style.overflow = ''; 
    }
  }
});

// ==========================================
// DÉSACTIVATION TEMPORAIRE (GitHub Pages + Local)
// ==========================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker désactivé sur GitHub Pages');
    }
  });
}

// Affichage dynamique de la version dans l'interface
document.addEventListener('DOMContentLoaded', () => {
  const versionSpan = document.getElementById('app-version');
  if (versionSpan) {
    const currentVersion = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : 'guide-perchance-v1.2.4';
    versionSpan.textContent = currentVersion;
  }
});
