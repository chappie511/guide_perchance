# guide_perchance
Guide interactif de Prompt Engineering pour Perchance — Styles, effets visuels et répertoire algorithmique par IA. Optimisé pour mobile et PC.

# 📖 Guide de Prompt Engineering Perchance

Un guide complet et interactif dédié au *Prompt Engineering* sur Perchance. Il regroupe styles, effets visuels et répertoires algorithmiques pour la génération d'images par IA, le tout optimisé pour une consultation fluide sur mobile et navigateur web.

---

## 🚀 Fonctionnalités
- **Architecture modulaire :** Découpage du guide en sections distiques (`section_01.html`, `section_02.html`, etc.) pour faciliter les révisions et la maintenance.
- **Chargement dynamique (JS) :** Assemblage automatique des 21 sections au démarrage via l'API `fetch()`.
- **Copie rapide des prompts :** Touchez ou cliquez sur n'importe quel bloc de prompt (`.prompt-box`) pour copier directement son texte dans le presse-papiers.
- **Interface Mobile-First :** Design épuré, accordéons rétractables et bouton de retour rapide vers le haut pour une navigation optimale sur téléphone.

---

## 📁 Structure du Dépôt

```text
guide_perchance/
 ├── css/
 │    └── index.css           # Feuilles de style UI & composantes
 ├── js/
 │    └── index.js            # Script de chargement dynamique et interactions
 ├── sections_du_guide/
 │    ├── section_01.html     # Contenu de la Section 1
 │    ├── section_02.html     # Contenu de la Section 2
 │    └── ...                 # Jusqu'à section_22.html
 ├── index.html               # Structure HTML principale
 └── README.md                # Documentation du projet
