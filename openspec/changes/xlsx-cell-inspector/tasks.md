## 1. Initialisation du projet

- [x] 1.1 Créer le projet Vite + React + TypeScript (`npm create vite@latest`)
- [x] 1.2 Installer les dépendances : `xlsx` (SheetJS), `@tanstack/react-virtual`
- [x] 1.3 Installer les dépendances de test : `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`
- [x] 1.4 Configurer `vitest.config.ts` avec environnement `jsdom` et setup `@testing-library/jest-dom`
- [x] 1.5 Configurer ESLint + Prettier
- [x] 1.6 Mettre en place la structure de dossiers : `components/`, `hooks/`, `utils/`, `types/`, `tests/fixtures/`
- [x] 1.7 Définir les types TypeScript pour les données de cellule (`CellData`, `CellStyle`, `WorkbookData`)
- [x] 1.8 Télécharger le fichier fixture **Financial Sample** (Microsoft Power BI) dans `src/tests/fixtures/financial-sample.xlsx` — source : learn.microsoft.com/power-bi/create-reports/sample-financial-download

## 2. Chargement du fichier (file-upload)

- [x] 2.1 Créer le composant `FileUploadZone` avec drag & drop et input fichier
- [x] 2.2 Implémenter la validation du type de fichier (`.xlsx` / `.xls` uniquement)
- [x] 2.3 Lire le fichier via `FileReader` et le passer au parser SheetJS dans un Web Worker
- [x] 2.4 Afficher un spinner/indicateur de chargement pendant le parsing
- [x] 2.5 Afficher un message d'erreur si le fichier est invalide ou la lecture échoue
- [x] 2.6 **[TEST]** `FileUploadZone` — rendu initial : zone de drop et bouton visible
- [x] 2.7 **[TEST]** `FileUploadZone` — sélection d'un fichier `.pdf` : message d'erreur affiché
- [x] 2.8 **[TEST]** `FileUploadZone` — drag over : classe CSS de highlight appliquée, retirée au drag leave
- [x] 2.9 **[TEST]** `FileUploadZone` — pendant le chargement : spinner visible, zone désactivée
- [x] 2.10 **[BROWSER]** Ouvrir le site, charger `financial-sample.xlsx` via drag & drop, vérifier que le spinner apparaît puis le classeur s'affiche

## 3. Parsing et extraction des données (SheetJS)

- [x] 3.1 Implémenter la fonction `parseWorkbook(arrayBuffer)` avec `cellStyles: true, cellFormula: true`
- [x] 3.2 Extraire la liste des feuilles et leurs noms
- [x] 3.3 Extraire les dimensions de chaque feuille (range utilisé)
- [x] 3.4 Extraire les largeurs de colonnes (en character width) et convertir en pixels
- [x] 3.5 Extraire les hauteurs de lignes (en points) et convertir en pixels
- [x] 3.6 Créer la structure de données normalisée `WorkbookData` pour l'état de l'application
- [x] 3.7 **[TEST]** `parseWorkbook` — parse du fixture : vérifie les noms de feuilles attendus
- [x] 3.8 **[TEST]** `parseWorkbook` — parse du fixture : vérifie la valeur brute et formatée d'une cellule connue (ex. cellule D2 = montant avec format currency)
- [x] 3.9 **[TEST]** `parseWorkbook` — cellule avec style : vérifie que `bold`, `fgColor`, `border` sont présents dans la sortie
- [x] 3.10 **[TEST]** `colWidthToPx(charWidth)` — conversion d'unités : vérifie les cas limites (0, valeur standard 8.43, grande valeur)
- [x] 3.11 **[TEST]** `rowHeightToPx(points)` — conversion d'unités : vérifie la proportionnalité
- [x] 3.12 **[BROWSER]** Après chargement du fixture, ouvrir DevTools → Network, vérifier qu'aucune requête réseau n'embarque les données du fichier

## 4. Affichage de la grille (spreadsheet-viewer)

- [x] 4.1 Créer le composant `SheetTabs` pour naviguer entre les feuilles
- [x] 4.2 Créer le composant `SpreadsheetGrid` avec virtualisation via `@tanstack/react-virtual`
- [x] 4.3 Implémenter les en-têtes de colonnes (A, B, C…) et numéros de lignes (1, 2, 3…)
- [x] 4.4 Rendre la valeur formatée dans chaque cellule
- [x] 4.5 Appliquer les styles visuels de base : `backgroundColor`, `color`, `fontWeight`, `fontStyle`, `textDecoration`
- [x] 4.6 Appliquer les largeurs de colonnes et hauteurs de lignes personnalisées
- [x] 4.7 **[TEST]** `SheetTabs` — rendu : un onglet par feuille du workbook mocké
- [x] 4.8 **[TEST]** `SheetTabs` — clic sur un onglet : callback `onSheetChange` appelé avec le bon index
- [x] 4.9 **[TEST]** `SpreadsheetGrid` — rendu : en-têtes A/B/C et 1/2/3 présents dans le DOM
- [x] 4.10 **[TEST]** `SpreadsheetGrid` — cellule avec valeur : texte visible dans la cellule correspondante
- [x] 4.11 **[TEST]** `SpreadsheetGrid` — cellule avec `backgroundColor` rouge : style CSS `background-color` appliqué
- [x] 4.12 **[TEST]** `SpreadsheetGrid` — cellule avec `bold: true` : style CSS `font-weight: bold` appliqué
- [x] 4.13 **[BROWSER]** Charger le fixture, naviguer entre les onglets, vérifier que les largeurs de colonnes et couleurs de fond correspondent visuellement au fichier ouvert dans Excel/LibreOffice

## 5. Panneau d'inspection (cell-inspector)

- [x] 5.1 Créer le composant `CellInspector` (panneau latéral ou drawer)
- [x] 5.2 Implémenter la logique de sélection de cellule au clic avec mise en évidence visuelle
- [x] 5.3 Créer la section **Valeur** : valeur brute, valeur formatée, type, formule
- [x] 5.4 Créer la section **Police** : nom, taille, gras, italique, souligné, barré, couleur (hex + swatch)
- [x] 5.5 Créer la section **Remplissage** : type, couleur de fond (hex + swatch), couleur de motif
- [x] 5.6 Créer la section **Bordures** : pour chaque côté (top/right/bottom/left/diagonal), style + couleur
- [x] 5.7 Créer la section **Alignement** : horizontal, vertical, word wrap, indent, shrink-to-fit, rotation
- [x] 5.8 Créer la section **Format** : code numFmt + numFmtId
- [x] 5.9 Créer la section **Dimensions** : largeur colonne (character width + px), hauteur ligne (pt + px)
- [x] 5.10 Créer la section **Protection** : locked, hidden
- [x] 5.11 Rendre chaque section pliable/dépliable (accordéon)
- [x] 5.12 Afficher un message "Aucune propriété définie" pour les sections vides
- [x] 5.13 **[TEST]** `CellInspector` — sans cellule sélectionnée : message d'invite affiché, aucune section rendue
- [x] 5.14 **[TEST]** `CellInspector` — cellule sélectionnée : référence (ex. `B4`) affichée en en-tête
- [x] 5.15 **[TEST]** `CellInspector` — section Valeur : type `number` correct pour une cellule numérique
- [x] 5.16 **[TEST]** `CellInspector` — section Police : couleur hex affichée, swatch de couleur rendu
- [x] 5.17 **[TEST]** `CellInspector` — section Bordures : tous les 4 côtés listés avec style et couleur
- [x] 5.18 **[TEST]** `CellInspector` — section Alignement : `wrapText: true` affiché correctement
- [x] 5.19 **[TEST]** `CellInspector` — section sans données : message "Aucune propriété définie" présent
- [x] 5.20 **[TEST]** `CellInspector` — accordéon : clic sur en-tête de section plie/déplie le contenu
- [x] 5.21 **[BROWSER]** Cliquer sur une cellule avec fond coloré du fixture → vérifier section Remplissage ; cliquer une cellule avec format monétaire → vérifier section Format ; cliquer cellule vide → vérifier messages "Aucune propriété"

## 6. UI & expérience développeur

- [x] 6.1 Implémenter le layout général : zone upload → grille + panneau latéral
- [x] 6.2 Afficher la référence de la cellule sélectionnée (ex. `B4`) en en-tête du panneau
- [x] 6.3 Afficher le nom de la feuille active et les dimensions du classeur (ex. `A1:Z100`)
- [x] 6.4 Ajouter un bouton "Fermer / charger un autre fichier" pour revenir à l'état initial
- [x] 6.5 Rendre l'interface responsive (mobile-friendly basique)
- [x] 6.6 **[TEST]** Layout — état initial : `FileUploadZone` visible, `SpreadsheetGrid` absent du DOM
- [x] 6.7 **[TEST]** Layout — après chargement : `SpreadsheetGrid` visible, `FileUploadZone` absente
- [x] 6.8 **[TEST]** Layout — clic "Fermer" : retour à l'état initial, `FileUploadZone` visible
- [x] 6.9 **[BROWSER]** Golden path complet : upload du fixture → navigation entre feuilles → sélection de plusieurs cellules → vérification que toutes les sections du panneau se remplissent correctement

## 7. Build et déploiement

- [x] 7.1 Configurer `vite.config.ts` pour un build statique (base path si hébergé dans un sous-dossier)
- [x] 7.2 Vérifier que `npm run build` produit un `dist/` déployable sans erreur
- [x] 7.3 Vérifier que `npm run test` passe tous les tests unitaires en CI (sans browser)
- [x] 7.4 **[BROWSER]** Servir le build de production (`npx serve dist/`), re-jouer le golden path pour confirmer l'absence de régressions en prod build
- [x] 7.5 Optionnel : configurer GitHub Actions pour déployer sur GitHub Pages
