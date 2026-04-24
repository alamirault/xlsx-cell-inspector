/ops## Why

Les développeurs qui génèrent des fichiers Excel par code (via des librairies comme ExcelJS, openpyxl, PhpSpreadsheet, etc.) n'ont aucun moyen simple de vérifier visuellement les propriétés exactes de chaque cellule (couleur de fond, bordures, largeur de colonne, word-wrap, format numérique, etc.). Cet outil leur offre une interface web pour inspecter instantanément toutes les caractéristiques d'un fichier XLSX, cellule par cellule.

## What Changes

- Nouveau site web statique (SPA) déployable sans backend
- Upload ou drag & drop d'un fichier `.xlsx` / `.xls`
- Affichage du contenu du classeur sous forme de grille (feuilles, lignes, colonnes)
- Clic sur une cellule → panneau latéral listant toutes ses propriétés OOXML
- Aucune donnée envoyée à un serveur — tout le traitement est côté client (confidentialité des données)

## Capabilities

### New Capabilities

- `file-upload`: Chargement d'un fichier Excel via drag & drop ou sélecteur de fichier, avec parsing côté client
- `spreadsheet-viewer`: Affichage du classeur en grille navigable (onglets feuilles, cellules, dimensions colonnes/lignes)
- `cell-inspector`: Panneau d'inspection affichant toutes les propriétés d'une cellule sélectionnée (style, format, alignement, bordures, protection, etc.)

### Modified Capabilities

## Impact

- **Dépendances** : SheetJS (xlsx) pour le parsing OOXML côté client ; framework UI léger (React + Vite recommandés)
- **Déploiement** : site 100% statique, pas de backend requis
- **Données** : aucune transmission réseau des données du fichier
