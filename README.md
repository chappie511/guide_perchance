# guide_perchance
Guide interactif de Prompt Engineering pour Perchance — Styles, effets visuels et répertoire algorithmique par IA. Optimisé pour mobile (PWA) et PC.

# 📖 Guide de Prompt Engineering Perchance

Un guide complet et interactif dédié au *Prompt Engineering* sur Perchance. Il regroupe styles, éclairages, poses, vues, effets visuels et répertoires algorithmiques pour la génération d'images par IA, le tout optimisé pour une consultation fluide sur mobile et navigateur web.

---

## 🚀 Fonctionnalités
- **Architecture modulaire :** Découpage du guide en 24 sections distinctes (`section_01.html` à `section_24.html`) pour faciliter la maintenance et le chargement.
- **Progressive Web App (PWA) & Offline :**
  - Fichier `manifest.json` pour installation sur écran d'accueil.
  - Service Worker (`sw.js`) gérant la mise en cache réseau (Cache-First pour CDN, Network-First pour le contenu local).
  - Toast de notification automatique lors d'une nouvelle version avec rechargement à chaud (`SKIP_WAITING`).
- **Chargement dynamique (JS) :** Assemblage automatique des 24 sections au démarrage via l'API `fetch()`.
- **Navigation & Modales :** Sommaires rapides par catégories (Styles, Vues, Perspectives, Poses, Éclairages, etc.) accessibles via fenêtres modales.
- **Copie rapide des prompts :** Touchez ou cliquez sur n'importe quel bloc de prompt (`.prompt-box`) pour copier directement son texte dans le presse-papiers avec retour visuel.
- **Interface Mobile-First :** Design épuré, accordéons rétractables et bouton de retour rapide vers le haut.

---

## 📁 Structure du Dépôt

```text
guide_perchance/
 ├── css/
 │    └── index.css           # Feuilles de style UI, modales & composantes
 ├── js/
 │    └── index.js            # Script de chargement dynamique, modales et gestion PWA
 ├── sections_du_guide/
 │    ├── section_01.html     # Contenu de la Section 1
 │    ├── section_02.html     # Contenu de la Section 2
 │    └── ...                 # Jusqu'à section_24.html
 ├── index.html               # Structure HTML principale & conteneurs
 ├── manifest.json            # Configuration PWA (icônes, couleurs, application)
 ├── sw.js                    # Service Worker (stratégies de cache et mises à jour)
 ├── version.js               # Gestionnaire de version unique (ex: APP_VERSION)
 └── README.md                # Documentation du projet
