// 1. Enregistrement sécurisé du Service Worker, affichage de version et gestion du Toast
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {

  const obtenirVersionDuSW = () => {
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.version) {
          const el = document.getElementById('app-version');
          if (el) el.textContent = event.data.version;
        }
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' }, 
        [messageChannel.port2]
      );
    }
  };

  document.addEventListener('DOMContentLoaded', obtenirVersionDuSW);

  window.addEventListener('load', () => {
    // Le paramètre ?v=1.5.4 force le navigateur distant à télécharger le nouveau sw.js
    navigator.serviceWorker.register('./sw.js?v=1.5.4').then((registration) => {
      console.log('Service Worker enregistré :', registration.scope);

      registration.update();

      if (registration.waiting) {
        afficherToastMiseAJour(registration);
      }

      registration.addEventListener('updatefound', () => {
        const nouveauWorker = registration.installing;
        if (nouveauWorker) {
          nouveauWorker.addEventListener('statechange', () => {
            if (nouveauWorker.state === 'installed' && navigator.serviceWorker.controller) {
              afficherToastMiseAJour(registration);
            }
          });
        }
      });
    });
  });

  let rechargementEnCours = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!rechargementEnCours) {
      rechargementEnCours = true;
      window.location.reload();
    }
  });
}

// 2. Fonction d'affichage du Toast avec animation fluide
function afficherToastMiseAJour(registration) {
  const toast = document.getElementById('toast');
  const btnReload = document.getElementById('reload-toast-btn');
  const btnClose = document.getElementById('close-toast-btn');

  if (!toast) return;

  // Affichage fluide
  toast.classList.remove('hidden');
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  // Clic sur "Rafraîchir"
  if (btnReload) {
    btnReload.onclick = () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    };
  }

  // Clic sur "Fermer"
  if (btnClose) {
    btnClose.onclick = () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.classList.add('hidden'), 300);
    };
  }
}

// Debounce léger pour regrouper le rendu des icônes Lucide lors du chargement assynchrone
let timerLucide = null;
function restituerIconesLucide() {
  clearTimeout(timerLucide);
  timerLucide = setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
}

// Charge automatiquement les 24 sections depuis le dossier sections_du_guide
for (let i = 1; i <= 24; i++) {
    const num = String(i).padStart(2, '0');
    const idBoite = `conteneur-section-${i}`;
    const cheminFichier = `./sections_du_guide/section_${num}.html`;

    chargerSection(idBoite, cheminFichier);
}

// Fonction pour charger et injecter du HTML de manière dynamique
function chargerSection(idDeLaBoite, cheminDuFichier) {
    const conteneur = document.getElementById(idDeLaBoite);
    if (!conteneur) return;

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
            
            restituerIconesLucide();

            if (typeof synchroniserBoutonsFavoris === 'function') {
                synchroniserBoutonsFavoris();
            }
        })
        .catch(erreur => {
            console.error("Erreur de chargement :", erreur);
            conteneur.innerHTML = `<div class="erreur-chargement" style="padding:10px; color:#b91c1c;">⚠️ Impossible de charger cette section.</div>`;
        });
}

// Copie des prompts dans le presse-papiers
document.addEventListener('click', function (e) {
  let boite = e.target.closest('.prompt-box');
  
  if (boite) {
    let texte = boite.innerText;
    
    navigator.clipboard.writeText(texte)
      .then(function() {
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
  if (!btn) return;

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

  // Ouverture de la modale des favoris depuis le menu latéral
  const btnFavoris = event.target.closest('#btnOuvrirFavoris');
  if (btnFavoris) {
    if (typeof closeMenu === 'function') {
      closeMenu();
    }
    if (typeof afficherFavorisMenu === 'function') {
      afficherFavorisMenu();
    }
    const modalFav = document.getElementById('modalFavoris');
    if (modalFav) {
      modalFav.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
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

// Bouton Eruda (Toggle fluide)
function lancerEruda() {
  if (typeof eruda === 'undefined') {
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.head.appendChild(script);
    script.onload = function () {
      eruda.init();
      eruda.show();
    };
  } else {
    if (eruda._isInit) {
      const erudaDom = document.querySelector('.eruda-container');
      if (erudaDom && erudaDom.style.display !== 'none') {
        eruda.hide();
      } else {
        eruda.show();
      }
    }
  }
}
