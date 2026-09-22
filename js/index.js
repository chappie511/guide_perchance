// 1. Enregistrement sécurisé du Service Worker, affichage de version et gestion du Toast
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  
  // Affichage immédiat de la version actuellement installée en cache
  const versionElement = document.getElementById('app-version');
  const versionInstallee = localStorage.getItem('app_installed_version') || window.APP_VERSION || window.LATEST_VERSION;
  
  if (versionElement && versionInstallee) {
    versionElement.textContent = versionInstallee;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      console.log('Service Worker enregistré avec succès :', registration.scope);

      // 🔍 Force la vérification d'une nouvelle version sur le serveur
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
    }).catch((erreur) => {
      console.warn('Enregistrement du Service Worker ignoré ou indisponible :', erreur);
    });
  });

  let rechargementEnCours = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!rechargementEnCours) {
      rechargementEnCours = true;
      
      // Met à jour le localStorage avec la nouvelle version juste avant de recharger la page
      const nouvelleVersion = window.APP_VERSION || window.LATEST_VERSION;
      if (nouvelleVersion) {
        localStorage.setItem('app_installed_version', nouvelleVersion);
      }
      
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


// --- GESTION DU SOMMAIRE LATÉRAL ---
const btnToggleToc = document.getElementById('btnToggleToc');
const btnCloseToc = document.getElementById('btnCloseToc');
const sideTocPanel = document.getElementById('sideTocPanel');
const sideTocOverlay = document.getElementById('sideTocOverlay');
const sideTocContent = document.querySelector('.side-toc-content');

// 1. Déclarations des variables d'état
let startX = 0;
let startY = 0; 
let isDragging = false;
let isScrolling = false; 
let panelWidth = 250;

// 2. Fonctions de contrôle du volet
function updatePanelWidth() {
  if (sideTocPanel) {
    panelWidth = sideTocPanel.offsetWidth || 250;
  }
}

function openToc() {
  if (!sideTocPanel || !btnToggleToc) return;
  sideTocPanel.classList.remove('no-transition');
  btnToggleToc.classList.remove('no-transition');

  sideTocPanel.classList.add('open');
  btnToggleToc.classList.add('open');
  
  btnToggleToc.style.transform = `translate3d(${panelWidth}px, 0, 0)`; 
  sideTocPanel.style.transform = 'translate3d(0, 0, 0)'; 
  
  if (sideTocOverlay) sideTocOverlay.classList.add('active');
  document.body.classList.add('toc-open');
}

function closeToc() {
  if (!sideTocPanel || !btnToggleToc) return;
  sideTocPanel.classList.remove('no-transition');
  btnToggleToc.classList.remove('no-transition');

  sideTocPanel.classList.remove('open');
  btnToggleToc.classList.remove('open');
  
  // Réinitialise complètement les styles injectés par le drag tactile
  btnToggleToc.style.transform = ''; 
  sideTocPanel.style.transform = ''; 

  if (sideTocOverlay) sideTocOverlay.classList.remove('active');
  document.body.classList.remove('toc-open');
}

function updatePanelWidth() {
  if (sideTocPanel) {
    panelWidth = sideTocPanel.offsetWidth || 250;
  }
}

window.addEventListener('resize', updatePanelWidth);
updatePanelWidth();


// 3. Écouteurs de clics
if (btnToggleToc) {
  btnToggleToc.addEventListener('click', () => {
    if (!isDragging) {
      const isOpen = sideTocPanel.classList.contains('open');
      if (isOpen) closeToc();
      else openToc();
    }
  });
}

if (btnCloseToc) btnCloseToc.addEventListener('click', closeToc);
if (sideTocOverlay) sideTocOverlay.addEventListener('click', closeToc);

document.addEventListener('click', function(e) {
  const link = e.target.closest('.side-toc-link');
  
  if (link) {
    // 1. Déverrouille le body immédiatement pour autoriser le défilement
    document.body.classList.remove('toc-open');
    
    // 2. Récupère l'ID ciblé (ex: "#section-1")
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      const targetDetails = document.querySelector(targetId);
      
      // 3. Force l'ouverture native du <details> si trouvé
      if (targetDetails && targetDetails.tagName === 'DETAILS') {
        targetDetails.open = true;
      }
    }

    // 4. Ferme le panneau latéral
    closeToc();
  }
});

// 5. Gestion des gestes tactiles (drag horizontal)
if (btnToggleToc && sideTocPanel) {

  btnToggleToc.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
    isScrolling = false;
  }, { passive: true });

  btnToggleToc.addEventListener('touchmove', (e) => {
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
        sideTocPanel.classList.add('no-transition');
        btnToggleToc.classList.add('no-transition');
        if (sideTocOverlay) sideTocOverlay.classList.add('active');
      }
    }

    if (isDragging) {
      const isOpen = sideTocPanel.classList.contains('open');

      if (!isOpen) {
        const moveX = Math.max(0, Math.min(deltaX, panelWidth));
        sideTocPanel.style.transform = `translate3d(${-panelWidth + moveX}px, 0, 0)`;
        btnToggleToc.style.transform = `translate3d(${moveX}px, 0, 0)`;
      } else {
        const moveX = Math.max(-panelWidth, Math.min(deltaX, 0));
        sideTocPanel.style.transform = `translate3d(${moveX}px, 0, 0)`;
        btnToggleToc.style.transform = `translate3d(${panelWidth + moveX}px, 0, 0)`;
      }
    }
  }, { passive: true });

  btnToggleToc.addEventListener('touchend', (e) => {
    sideTocPanel.classList.remove('no-transition');
    btnToggleToc.classList.remove('no-transition');

    if (isDragging) {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      const isOpen = sideTocPanel.classList.contains('open');

      if (!isOpen) {
        if (deltaX > 60) openToc();
        else closeToc();
      } else {
        if (deltaX < -60) closeToc();
        else openToc();
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


//Boutton Eruda
function lancerEruda() {
  if (typeof eruda === 'undefined') {
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.head.appendChild(script);
    script.onload = function () { eruda.init(); };
  } else {
    eruda.show();
  }
}
