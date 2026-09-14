// Fonction pour charger et injecter du HTML de manière dynamique
function chargerSection(idDeLaBoite, cheminDuFichier) {
    const conteneur = document.getElementById(idDeLaBoite);
    if (!conteneur) return;

    // Protection anti-dédoublement : ne réinjecte pas si déjà chargée avec succès
    if (conteneur.children.length > 0 && !conteneur.querySelector('.erreur-chargement')) return;

    fetch(cheminDuFichier)
        .then(reponse => {
            if (!reponse.ok) {
                throw new Error("Erreur HTTP " + reponse.status + " pour " + cheminDuFichier);
            }
            return reponse.text();
        })
        .then(texteHtml => {
            conteneur.innerHTML = texteHtml;
        })
        .catch(erreur => {
            console.error("Erreur de chargement :", erreur);
            conteneur.innerHTML = `<div class="erreur-chargement" style="padding:10px; color:#b91c1c;">⚠️ Impossible de charger cette section.</div>`;
        });
}

// Charge automatiquement les 24 sections depuis le dossier sections_du_guide
for (let i = 1; i <= 24; i++) {
    const num = String(i).padStart(2, '0');
    
    // ID sans zéro pour cibler exactement index.html (ex: conteneur-section-1)
    const idBoite = `conteneur-section-${i}`;
    
    // Chemin réseau avec zéro pour cibler le fichier physique (ex: section_01.html)
    const cheminFichier = `./sections_du_guide/section_${num}.html`;
    
    chargerSection(idBoite, cheminFichier);
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
  if (!btn) return; // Quitte silencieusement si le bouton n'est pas trouvé dans la page

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

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        registration.update();

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              const toast = document.getElementById('update-toast');
              if (toast) toast.classList.add('visible');
            }
          });
        });
      })
      .catch((err) => console.error('Échec enregistrement SW:', err));
  });

  // Recharge la page automatiquement quand le nouveau SW prend le contrôle
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Action du bouton de rafraîchissement
const reloadBtn = document.getElementById('reload-btn');
if (reloadBtn) {
  reloadBtn.addEventListener('click', () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        // Envoie le message au SW pour qu'il s'active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // Si aucun SW en attente, recharge la page directement
        window.location.reload();
      }
    });
  });
}

// Affichage dynamique et autonome de la version
function afficherVersion() {
  const versionSpan = document.getElementById('app-version');
  if (versionSpan) {
    versionSpan.textContent = 'v1.3.2';
  }
}

// Exécution immédiate + écouteurs de secours
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', afficherVersion);
} else {
  afficherVersion();
}
window.addEventListener('load', afficherVersion);
