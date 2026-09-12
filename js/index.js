// Numéro de version unique pour votre projet
const APP_VERSION = 'guide-perchance-v1.5';

// Fonction pour charger et injecter du HTML de manière dynamique
function chargerSection(idDeLaBoite, cheminDuFichier) {
    fetch(cheminDuFichier)
        .then(reponse => {
            if (!reponse.ok) {
                throw new Error("Impossible de charger " + cheminDuFichier);
            }
            return reponse.text();
        })
        .then(texteHtml => {
            document.getElementById(idDeLaBoite).innerHTML = texteHtml;
        })
        .catch(erreur => console.error("Erreur :", erreur));
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
    
    navigator.clipboard.writeText(texte)
      .then(function() { 
        alert("Prompt copié dans le presse-papiers ! 📋"); 
      })
      .catch(function(erreur) { 
        alert("Bloqué par le navigateur : " + erreur); 
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

function afficherNotificationMAJ(worker) {
  const toast = document.getElementById('update-toast');
  const btnRecharger = document.getElementById('reload-btn');

  if (toast) {
    toast.classList.remove('hidden');
    toast.classList.add('visible');
  }

  if (btnRecharger && worker) {
    btnRecharger.onclick = () => {
      if (toast) {
        toast.classList.remove('visible');
        toast.classList.add('hidden');
      }
      worker.postMessage({ type: 'SKIP_WAITING' });
    };
  }
}
   

if ('serviceWorker' in navigator) {
  if (estServeurLocal) {
    // EN LOCAL : On désactive le Service Worker pour coder tranquillement
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  } else {
    // EN LIGNE (GitHub Pages) : Gestion propre par Toast
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      
      // Si une mise à jour est déjà en attente
      if (registration.waiting) {
        afficherNotificationMAJ(registration.waiting);
      }

      // Si une mise à jour est trouvée pendant que la page est ouverte
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              afficherNotificationMAJ(newWorker);
            }
          });
        }
      });
    });

    // Recharge la page une seule fois quand le nouveau SW prend le contrôle
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
    if (estServeurLocal) {
      versionSpan.textContent = `${APP_VERSION} (Mode Local - TrebEdit)`;
    } else {
      versionSpan.textContent = APP_VERSION;
    }
  }
});
