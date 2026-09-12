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
  
  if (event.target && event.target.id === 'btnOuvrirÉclairages') {
    document.getElementById('modalÉclairages').classList.add('active');
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
// Enregistrement du Service Worker & Notifications
// ==========================================

const estServeurLocal = location.hostname === 'localhost' || 
                       location.hostname === '127.0.0.1' || 
                       location.hostname.startsWith('192.168.') || 
                       location.hostname.startsWith('10.');

let newWorker;

function afficherNotificationMAJ(worker) {
  newWorker = worker;
  const toast = document.getElementById('update-toast');

  if (toast) {
    toast.classList.remove('hidden');
    toast.classList.add('visible');
  }
}

// Clic sur le bouton "Rafraîchir" du Toast
const btnRecharger = document.getElementById('reload-btn');
if (btnRecharger) {
  btnRecharger.onclick = () => {
    const toast = document.getElementById('update-toast');
    if (toast) {
      toast.classList.remove('visible');
      toast.classList.add('hidden');
    }
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };
}

if ('serviceWorker' in navigator) {
  if (estServeurLocal) {
    // EN LOCAL : Désactivation pour le développement dans TrebEdit
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  } else {
    // EN LIGNE (GitHub Pages) : Gestion PWA
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      
      // Si une mise à jour est déjà en attente au chargement
      if (registration.waiting) {
        afficherNotificationMAJ(registration.waiting);
      }

      // Si une mise à jour est détectée pendant l'utilisation
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              afficherNotificationMAJ(installingWorker);
            }
          });
        }
      });
    });

    // Rechargement automatique déclenché par l'activation du nouveau SW
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

// Affichage dynamique de la version dans l'interface
document.addEventListener('DOMContentLoaded', () => {
  const versionSpan = document.getElementById('app-version');
  if (versionSpan) {
    // 1. Détecte la version globale ou utilise la version courante du projet
    const currentVersion = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : 'guide-perchance-v1.2.2';

    // 2. Met à jour l'affichage dans le DOM
    if (estServeurLocal) {
      versionSpan.textContent = `${currentVersion} (Mode Local - TrebEdit)`;
    } else {
      versionSpan.textContent = currentVersion;
    }
  }
});
