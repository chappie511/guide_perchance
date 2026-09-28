// ==========================================
// CONFIGURATION ET ÉTATS
// ==========================================
const STORAGE_KEY_FAVS = 'guide_prompt_favoris';

// ==========================================
//    GESTION DU MENU D'OPTIONS LATÉRAL
// ==========================================
const btnToggleMenu = document.getElementById('btnToggleMenu');
const btnCloseMenu = document.getElementById('btnCloseMenu');
const sideMenuPanel = document.getElementById('sideMenuPanel');
const sideMenuOverlay = document.getElementById('sideMenuOverlay');

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
  document.body.classList.add('menu-open');
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

// Écouteurs de clics pour le volet
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

// Gestes tactiles (Drag)
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

// ==========================================
// GESTION DES FAVORIS (LOCALSTORAGE ET MODALE)
// ==========================================

function getFavoris() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS)) || [];
}

function saveFavoris(favoris) {
  localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favoris));
  afficherFavorisMenu();
  synchroniserBoutonsFavoris();
}

function toggleFavori(id, titre) {
  let favoris = getFavoris();
  const index = favoris.findIndex(item => item.id === id);

  if (index > -1) {
    favoris.splice(index, 1);
  } else {
    favoris.push({ id, titre });
  }

  saveFavoris(favoris);
}

function supprimerFavori(id) {
  let favoris = getFavoris();
  favoris = favoris.filter(item => item.id !== id);
  saveFavoris(favoris);
}

function initialiserIconesLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Génération dynamique de la liste dans la modale
function afficherFavorisMenu() {
  const modalList = document.getElementById('favoritesListModal');
  if (!modalList) return;

  const favoris = getFavoris();

  if (favoris.length === 0) {
    modalList.innerHTML = '<p class="empty-favorites">Aucun favori pour le moment.</p>';
    return;
  }

  modalList.innerHTML = favoris.map(fav => `
    <div class="favorite-item" onclick="naviguerVersFavori('${fav.id}')">
      <span>${fav.titre}</span>
      <button type="button" class="btn-remove-favorite" onclick="event.stopPropagation(); supprimerFavori('${fav.id}')" title="Supprimer des favoris">
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  `).join('');

  initialiserIconesLucide();
}

// Navigation optimisée vers la carte
function naviguerVersFavori(id) {
  fermerModaleEtMenu();

  setTimeout(() => {
    // 1. Chercher la carte cible par data-id ou id
    let cible = document.querySelector(`[data-id="${id}"]`) || document.getElementById(id);

    // 2. Si l'élément n'est pas trouvé par ID direct, chercher par l'attribut onclick du bouton favori
    if (!cible) {
      const btnFav = document.querySelector(`.btn-favorite[onclick*="${id}"]`);
      if (btnFav) {
        cible = btnFav.closest('[data-id]') || btnFav.closest('.card') || btnFav.parentElement;
      }
    }

    if (cible) {
      // 3. Déplier tous les parents masqués/accordéons s'il y en a
      let parent = cible.parentElement;
      while (parent && parent !== document.body) {
        if (parent.classList.contains('hidden') || parent.style.display === 'none') {
          parent.style.display = 'block';
          parent.classList.remove('hidden');
        }
        if (parent.tagName === 'DETAILS') {
          parent.open = true;
        }
        parent = parent.parentElement;
      }

      // 4. Déplacement fluide vers le HAUT de l'élément (alignement parfait)
      cible.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 5. Petit effet visuel pour repérer la carte
      cible.classList.add('highlight-favori');
      setTimeout(() => cible.classList.remove('highlight-favori'), 2000);
    } else {
      console.warn(`Carte introuvable pour le favori : ${id}`);
    }
  }, 300);
}

function ouvrirModaleFavoris() {
  const modal = document.getElementById('modalFavoris');
  if (modal) {
    afficherFavorisMenu();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function fermerModaleFavoris() {
  const modal = document.getElementById('modalFavoris');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function fermerModaleEtMenu() {
  if (typeof closeMenu === 'function') closeMenu();
  fermerModaleFavoris();
}

// Synchronisation de l'étoile active
function synchroniserBoutonsFavoris() {
  const favoris = getFavoris();
  const favIds = favoris.map(f => f.id);

  document.querySelectorAll('.btn-favorite').forEach(btn => {
    const parentCard = btn.closest('[data-id]') || btn.closest('[id]');
    let id = btn.getAttribute('data-id');
    
    if (!id && parentCard) {
      id = parentCard.getAttribute('data-id') || parentCard.id;
    }

    if (!id) {
      const onclickAttr = btn.getAttribute('onclick') || '';
      const match = onclickAttr.match(/toggleFavori\(['"]([^'"]+)['"]/);
      if (match) id = match[1];
    }

    if (id && favIds.includes(id)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  initialiserIconesLucide();
}

// ==========================================
// DIVERS ET INITIALISATION
// ==========================================

function basculerPleinEcran() {
  if (!document.fullscreenElement) {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  afficherFavorisMenu();
  initialiserIconesLucide();
});
