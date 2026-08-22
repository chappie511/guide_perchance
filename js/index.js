// Fonction pour charger et injecter du HTML
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
    // Le chemin pointe maintenant correctement vers ton nouveau dossier !
    chargerSection(`conteneur-section-${i}`, `./sections_du_guide/section_${num}.html`);
}

// Script sélectionné/copié (Délégation d'événements)
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

// Script retour vers le haut
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


// Écouteur universel pour toute la page
document.addEventListener('click', function(event) {
  
  // 1. OUVRIR LE MODAL DES POSES
  if (event.target && event.target.id === 'btnOuvrirPoses') {
    document.getElementById('modalPoses').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 2. OUVRIR LE MODAL DES VUES
  if (event.target && event.target.id === 'btnOuvrirVues') {
    document.getElementById('modalVues').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // 3. OUVRIR LE MODAL DE LA SECTION 18
  if (event.target && event.target.id === 'btnOuvrirSec18') {
    document.getElementById('modalSec18').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // 4. OUVRIR LE MODAL DE LA 🎭 Section 03 : Répertoire des Styles & Paramètres (Perchance)
  if (event.target && event.target.id === 'btnOuvrirStyles') {
    document.getElementById('modalStyles').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 5. FERMER LES MODALS (Bouton fermer OU clic sur un lien de navigation)
  if (event.target && (event.target.classList.contains('btn-close-menu') || event.target.classList.contains('quick-nav-btn'))) {
    // La fonction closest() trouve le modal parent dans lequel on vient de cliquer
    const modalActif = event.target.closest('.modal-overlay');
    if (modalActif) {
      modalActif.classList.remove('active');
      document.body.style.overflow = ''; 
    }
  }
  
});
