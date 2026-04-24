## Context

Outil de développement web 100% client-side pour inspecter les propriétés OOXML d'un fichier Excel. Aucune infrastructure backend n'est nécessaire. La cible est un développeur qui génère des fichiers `.xlsx` et veut vérifier visuellement les attributs exacts de ses cellules sans avoir à ouvrir l'XML brut.

## Goals / Non-Goals

**Goals:**
- Parser un fichier `.xlsx` / `.xls` entièrement dans le navigateur
- Afficher le contenu sous forme de grille fidèle à Excel (lignes, colonnes, onglets)
- Exposer toutes les propriétés d'une cellule cliquée dans un panneau dédié
- Zéro backend, zéro upload réseau — confidentialité totale
- Interface rapide à charger (SPA statique)

**Non-Goals:**
- Édition du fichier Excel
- Export ou transformation de données
- Support des formules (calcul/évaluation)
- Rendu pixel-perfect d'Excel (graphiques, images, formes)
- Authentification ou gestion multi-utilisateurs

## Decisions

### Stack : React + Vite + TypeScript
**Pourquoi React ?** Composants réactifs adaptés à l'état sélection-cellule → panneau. Écosystème mature, large support.
**Pourquoi Vite ?** Build ultra-rapide pour SPA statique, HMR en dev.
**Alternative considérée** : Vue 3 — rejetée car l'écosystème de composants tableau est moins riche; Vanilla JS — trop verbeux pour gérer l'état de sélection.

### Parser XLSX : SheetJS (xlsx)
La librairie de référence pour parser les formats Excel dans le navigateur. Elle expose les données de cellule sous forme d'objets avec le style OOXML (via `cellStyles: true`).
**Alternative considérée** : ExcelJS — focus côté Node, bundle trop lourd pour le browser; xlsx-js-style — fork non maintenu.

### Affichage de la grille : rendu custom (div/table virtualisé)
Une grille Excel peut avoir des milliers de lignes. Un rendu naïf `<table>` ne passe pas à l'échelle.
**Décision** : utiliser `@tanstack/react-virtual` pour virtualiser lignes et colonnes.
**Alternative considérée** : AG Grid (trop lourd, licence complexe); react-spreadsheet (ne préserve pas les styles).

### Panneau d'inspection : affichage en sections groupées
Les propriétés d'une cellule sont regroupées par domaine (Valeur, Style, Alignement, Bordures, Protection) pour la lisibilité. Chaque propriété est affichée `nom: valeur` avec valeur brute OOXML.

### Tests : Vitest + React Testing Library
**Pourquoi Vitest ?** Intégration native Vite (même config, même pipeline), extrêmement rapide, API compatible Jest.
**Pourquoi RTL ?** Tests orientés comportement utilisateur (clics, rendu conditionnel, accessibilité) plutôt que détails d'implémentation.
**Environnement** : `jsdom` pour simuler le DOM dans les tests unitaires.
**Alternative considérée** : Jest — config plus lourde, pas natif Vite; Cypress Component Testing — trop lourd pour du unit testing.

**Stratégie de couverture** :
- `utils/` (parsing, conversion d'unités) → tests purs sur les fonctions
- `hooks/` (useWorkbook, useSelectedCell) → `renderHook` RTL
- `components/` → tests comportementaux : rendu initial, interactions, états d'erreur, affichage conditionnel des sections

**Fixture de test** : fichier **Financial Sample** de Microsoft (source officielle Power BI), disponible publiquement. Contient des données réalistes avec formats numériques (currency, %), plusieurs feuilles, cellules avec styles. À télécharger dans `src/tests/fixtures/financial-sample.xlsx`.

### Déploiement : site statique
Build Vite → `dist/` → déployable sur GitHub Pages, Netlify, Vercel sans configuration serveur.

## Risks / Trade-offs

| Risque | Mitigation |
|---|---|
| SheetJS ne lit pas tous les attributs de style (ex. rich text inline) | Documenter les limites connues dans l'UI ; afficher les données brutes XML si nécessaire |
| Fichiers très lourds (>10 Mo) peuvent bloquer le thread principal | Utiliser un Web Worker pour le parsing |
| Largeurs/hauteurs de colonnes: unités OOXML ≠ pixels | Convertir les unités EMU/character width en pixels approchés avec note dans l'UI |
| Compatibilité `.xls` (ancien format binaire) | SheetJS supporte BIFF8, mais les données de style sont moins complètes — avertir l'utilisateur |
