// ==========================================
// 1. Chargement dynamique des sections
// ==========================================

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

// ==========================================
// 2. Presse-papiers & Bouton Retour en haut
// ==========================================

// Copie des prompts dans le presse-papiers avec secours pour mobile
document.addEventListener('click', function (e) {
  let boite = e.target.closest('.prompt-box');
  
  if (boite) {
    let texte = boite.innerText;
    
    function animationSucces() {
      boite.style.outline = "2px solid #22c55e";
      
      // Amélioration : Petit indicateur temporaire
      const ancienTitre = boite.getAttribute('title');
      boite.setAttribute('title', 'Copié dans le presse-papiers !');

      setTimeout(() => {
        boite.style.outline = "";
        if (ancienTitre) {
          boite.setAttribute('title', ancienTitre);
        } else {
          boite.removeAttribute('title');
        }
      }, 1200);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(animationSucces).catch(() => {
        copierSecours(texte);
      });
    } else {
      copierSecours(texte);
    }

    function copierSecours(textToCopy) {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed'; // Évite de scroller la page sur mobile
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        animationSucces();
      } catch (err) {
        console.error('Échec de la copie secours', err);
      }
      document.body.removeChild(textarea);
    }
  }
});

// Bouton retour vers le haut
(function () {
  var btn = document.getElementById('backToTopBtn');
  if (btn) {
    function onScroll() {
      if (window.scrollY > 1900) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }
})();

// ==========================================
// 3. Gestion des Modales & Navigation Ancre
// ==========================================

// Fonction utilitaire pour fermer toutes les modales
function fermerModales() {
  const modalesActives = document.querySelectorAll('.modal-overlay.active');
  modalesActives.forEach(modal => modal.classList.remove('active'));
  document.body.style.overflow = '';
}

// Écouteur global des clics
document.addEventListener('click', function(event) {
  
  // Ouverture des modales
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

  // Fermeture explicite via le bouton "Fermer le menu"
  if (event.target && event.target.classList.contains('btn-close-menu')) {
    fermerModales();
  }

  // Fermeture en cliquant sur le fond de la modale (hors du contenu inner)
  if (event.target && event.target.classList.contains('modal-overlay')) {
    fermerModales();
  }

  // Clic sur un lien de navigation rapide (ex. <a href="#style-casual">)
  const lienAncre = event.target.closest('a[href^="#"]');
  if (lienAncre) {
    const targetId = lienAncre.getAttribute('href');

    if (targetId && targetId !== '#') {
      event.preventDefault();

      // Fermer les modales et débloquer le scroll
      fermerModales();

      // Attendre 50ms pour laisser la modale se masquer puis scroller vers la cible
      setTimeout(function () {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          console.warn("Élément cible non trouvé : " + targetId);
        }
      }, 50);
    }
  }
});

// Écouteur pour fermer la modale avec la touche 'Échap' (Escape)
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    fermerModales();
  }
});

// ==========================================
// 4. Enregistrement du Service Worker & PWA
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
      
      if (registration.waiting) {
        afficherNotificationMAJ(registration.waiting);
      }

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
      versionSpan.textContent = `${typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'v1.0'} (Mode Local - TrebEdit)`;
    } else {
      versionSpan.textContent = typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'v1.0';
    }
  }
});
