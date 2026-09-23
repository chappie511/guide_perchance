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
    // Le paramètre ?v=1.5.0 force le navigateur distant à télécharger le nouveau sw.js
    navigator.serviceWorker.register('./sw.js?v=1.5.0').then((registration) => {
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


// Charge automatiquement les 24 sections depuis le dossier sections_du_guide
for (let i = 1; i <= 24; i++) {
    const num = String(i).padStart(2, '0');
    
    // ID du conteneur dans index.html (ex: conteneur-section-1)
    const idBoite = `conteneur-section-${i}`;
    
    // Chemin vers le fichier physique (ex: section_01.html)
    const cheminFichier = `./sections_du_guide/section_${num}.html`;

    chargerSection(idBoite, cheminFichier);
}

// --- 1. GARDER : La fonction utilitaire ---
function debounce(func, delay = 150) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

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


// ==========================================
//    GESTION DU MENU D'OPTIONS LATÉRAL
// ==========================================
const btnToggleMenu = document.getElementById('btnToggleMenu'); // Ancien btnToggleToc
const btnCloseMenu = document.getElementById('btnCloseMenu');   // Ancien btnCloseToc
const sideMenuPanel = document.getElementById('sideMenuPanel');   // Ancien sideTocPanel
const sideMenuOverlay = document.getElementById('sideMenuOverlay'); // Ancien sideTocOverlay

let startX = 0;
let startY = 0; 
let isDragging = false;
let isScrolling = false; 
let panelWidth = 250;

function updatePanelWidth() {
  if (sideMenuPanel) {
    panelWidth = sideMenuPanel.offsetWidth || 250;
  }
}

function openMenu() {
  if (!sideMenuPanel || !btnToggleMenu) return;
  sideMenuPanel.classList.remove('no-transition');
  btnToggleMenu.classList.remove('no-transition');

  sideMenuPanel.classList.add('open');
  btnToggleMenu.classList.add('open');
  
  btnToggleMenu.style.transform = `translate3d(${panelWidth}px, -50%, 0)`; 
  sideMenuPanel.style.transform = 'translate3d(0, 0, 0)'; 
  
  if (sideMenuOverlay) sideMenuOverlay.classList.add('active');
  document.body.classList.add('menu-open'); // Changé toc-open -> menu-open
}

function closeMenu() {
  if (!sideMenuPanel || !btnToggleMenu) return;
  sideMenuPanel.classList.remove('no-transition');
  btnToggleMenu.classList.remove('no-transition');

  sideMenuPanel.classList.remove('open');
  btnToggleMenu.classList.remove('open');
  
  btnToggleMenu.style.transform = ''; 
  sideMenuPanel.style.transform = ''; 

  if (sideMenuOverlay) sideMenuOverlay.classList.remove('active');
  document.body.classList.remove('menu-open');
}

window.addEventListener('resize', updatePanelWidth);
updatePanelWidth();

// Écouteurs de clics
if (btnToggleMenu) {
  btnToggleMenu.addEventListener('click', () => {
    if (!isDragging) {
      const isOpen = sideMenuPanel.classList.contains('open');
      if (isOpen) closeMenu();
      else openMenu();
    }
  });
}

if (btnCloseMenu) btnCloseMenu.addEventListener('click', closeMenu);
if (sideMenuOverlay) sideMenuOverlay.addEventListener('click', closeMenu);

// --- SUPPRESSION DE L'ÉCOUTEUR '.side-toc-link' DEVENU INUTILE ---

// Gestion des gestes tactiles (drag horizontal pour ouvrir/fermer)
if (btnToggleMenu && sideMenuPanel) {
  btnToggleMenu.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
    isScrolling = false;
  }, { passive: true });

  btnToggleMenu.addEventListener('touchmove', (e) => {
    if (isScrolling) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (!isDragging) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
        isScrolling = true;
        return;
      }
      if (Math.abs(deltaX) > 5) {
        isDragging = true;
        sideMenuPanel.classList.add('no-transition');
        btnToggleMenu.classList.add('no-transition');
        if (sideMenuOverlay) sideMenuOverlay.classList.add('active');
      }
    }

    if (isDragging) {
      const isOpen = sideMenuPanel.classList.contains('open');
      if (!isOpen) {
        const moveX = Math.max(0, Math.min(deltaX, panelWidth));
        sideMenuPanel.style.transform = `translate3d(${-panelWidth + moveX}px, 0, 0)`;
        btnToggleMenu.style.transform = `translate3d(${moveX}px, -50%, 0)`; 
      } else {
        const moveX = Math.max(-panelWidth, Math.min(deltaX, 0));
        sideMenuPanel.style.transform = `translate3d(${moveX}px, 0, 0)`;
        btnToggleMenu.style.transform = `translate3d(${panelWidth + moveX}px, -50%, 0)`; 
      }
    }
  }, { passive: true });

  btnToggleMenu.addEventListener('touchend', (e) => {
    sideMenuPanel.classList.remove('no-transition');
    btnToggleMenu.classList.remove('no-transition');

    if (isDragging) {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      const isOpen = sideMenuPanel.classList.contains('open');

      if (!isOpen) {
        if (deltaX > 50) openMenu();
        else closeMenu();
      } else {
        if (deltaX < -50) closeMenu();
        else openMenu();
      }
    }
    isDragging = false;
    isScrolling = false;
  }, { passive: true });
}

//API Fullscreen
function basculerPleinEcran() {
  if (!document.fullscreenElement) {
    // Active le plein écran (prend en compte les déclinaisons des navigateurs)
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari / iOS */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  } else {
    // Quitte le plein écran
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

// Bouton Lucide
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
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
