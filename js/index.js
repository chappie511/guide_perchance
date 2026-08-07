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

// Charge automatiquement les 22 sections depuis le dossier sections_du_guide
for (let i = 1; i <= 22; i++) {
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
