## 1. Dépendance et types

- [x] 1.1 Installer `fflate` : `npm install fflate`
- [x] 1.2 Définir le type `ResolvedProperty<T>` avec champ `value: T` et `source: { element: string }` dans `src/types/index.ts`
- [x] 1.3 Définir le type `ResolvedStyle` couvrant font (bold, italic, underline, strike, size, name, family, color, charset, vertAlign), fill (patternType, fgColor, bgColor), border (top/right/bottom/left/diagonal avec style+color, diagonalUp, diagonalDown), alignment (horizontal, vertical, wrapText, indent, shrinkToFit, textRotation), protection (locked, hidden), numFmt, numFmtId
- [x] 1.4 Ajouter `resolvedStyle?: ResolvedStyle` à `CellData` dans `src/types/index.ts`
- [x] 1.5 Définir les types internes `StylesIndex`, `XfDef`, `FontDef`, `FillDef`, `BorderDef`, `NumFmtDef` dans `src/utils/parseStyles.ts` (nouveau fichier)

## 2. Parser styles.xml

- [x] 2.1 Créer `src/utils/parseStyles.ts` — fonction `parseStylesXml(xml: string, domParser: DOMParser): StylesIndex` qui lit les sections `<fonts>`, `<fills>`, `<borders>`, `<numFmts>`, `<cellXfs>`
- [x] 2.2 Implémenter `resolveStyle(index: number, stylesIndex: StylesIndex): ResolvedStyle` qui suit la chaîne xf → font/fill/border et annote chaque propriété avec sa source (`font[N]`, `fill[N]`, `border[N]`, `xf[N]`)
- [x] 2.3 Gérer la conversion couleur dans `resolveStyle` : `rgb="FFRRGGBB"` → `#RRGGBB`, `theme="N" tint="X"` → `"theme:N tint:X"`, `indexed="N"` → `"indexed:N"`
- [ ] 2.4 **[TEST]** `parseStylesXml` — parsing du fixture `financial-sample.xlsx` : vérifie le nombre de fonts, fills, cellXfs
- [ ] 2.5 **[TEST]** `resolveStyle` — style avec fontId pointant sur bold+color : vérifie que `font.bold.value === true` et `font.bold.source.element === "font[N]"`
- [ ] 2.6 **[TEST]** `resolveStyle` — index 0 (style par défaut) : ne throw pas
- [ ] 2.7 **[TEST]** `resolveStyle` — couleur theme : produit `"theme:1 tint:-0.25"` sans crash

## 3. Intégration dans le Worker

- [x] 3.1 Dans `src/workers/parser.worker.ts`, utiliser `fflate.unzipSync` pour extraire `xl/styles.xml` de l'ArrayBuffer reçu
- [x] 3.2 Appeler `parseStylesXml` avec le contenu extrait pour obtenir le `StylesIndex`
- [x] 3.3 Appeler `XLSX.read()` **sans** `cellStyles: true` pour conserver `cell.s` comme entier (index)
- [x] 3.4 Dans `parseWorkbook.ts`, remplacer `extractStyle(cell.s)` par `resolveStyle(cell.s as number, stylesIndex)` et stocker le résultat dans `cellData.resolvedStyle`
- [x] 3.5 Supprimer la fonction `extractStyle()` et l'import de `xlsxColorToHex` dans `parseWorkbook.ts` (plus nécessaires)
- [x] 3.6 Garder `cell.z` → `numFmt` merge existant sur `resolvedStyle` si numFmt absent
- [ ] 3.7 **[TEST]** `parseWorkbook` avec `financial-sample.xlsx` : cellule avec style connu a `resolvedStyle.font.bold.value === true` ou `resolvedStyle.fill.fgColor.value === "#XXXXXX"` selon le cas
- [ ] 3.8 **[TEST]** Worker parse `test ala.xlsx` : `resolvedStyle` de A1 a `font.bold.value === true`, `font.color.value === "#BF0041"`, `fill.fgColor.value === "#00A933"`

## 4. Vue structurée mise à jour

- [x] 4.1 Dans `CellInspector.tsx`, remplacer la lecture de `cell.style` par `cell.resolvedStyle` pour alimenter les sections existantes (extraire `.value` de chaque `ResolvedProperty`)
- [x] 4.2 Adapter la section Police : utiliser `resolvedStyle.font?.bold?.value`, `resolvedStyle.font?.color?.value`, etc.
- [x] 4.3 Adapter la section Remplissage : utiliser `resolvedStyle.fill?.fgColor?.value`, etc.
- [x] 4.4 Adapter les sections Bordures, Alignement, Format numérique, Protection de même
- [x] 4.5 Adapter `SpreadsheetGrid.tsx` pour lire `cell.resolvedStyle` au lieu de `cell.style` pour le rendu visuel (backgroundColor, color, fontWeight, etc.)
- [x] 4.6 **[TEST]** `CellInspector` avec cellule ayant `resolvedStyle.font.bold = {value: true, source: {element: "font[4]"}}` : section Police affiche "Gras ✓ Oui"

## 5. Vue JSON-like

- [x] 5.1 Créer `src/components/CellInspector/RawStyleView.tsx` — composant qui reçoit `ResolvedStyle` et le rend en arbre JSON-like avec groupes `<details>/<summary>` ouverts par défaut
- [x] 5.2 Chaque propriété est rendue comme `key: value  · source` (source en secondaire, couleur atténuée)
- [x] 5.3 Les valeurs de couleur affichent un swatch coloré inline comme dans la vue structurée
- [x] 5.4 Ajouter le toggle `[≡] [{ }]` dans le header de `CellInspector` (deux boutons ou tabs) avec état global `viewMode: 'structured' | 'json'`
- [x] 5.5 Conditionner l'affichage : `viewMode === 'structured'` → sections existantes, `viewMode === 'json'` → `<RawStyleView>`
- [x] 5.6 Afficher `{}` ou message "Aucune donnée de style" si `resolvedStyle` est undefined en mode JSON
- [x] 5.7 **[TEST]** `RawStyleView` — rendu avec resolvedStyle complet : toutes les propriétés présentes dans le DOM
- [x] 5.8 **[TEST]** `RawStyleView` — source annotation visible : "font[4]" présent dans le rendu
- [x] 5.9 **[TEST]** Toggle — clic sur bouton JSON : `RawStyleView` visible, sections nommées absentes
- [x] 5.10 **[TEST]** Toggle — persistance : changement de cellule conserve le mode JSON actif
- [ ] 5.11 **[BROWSER]** Charger `test ala.xlsx`, cliquer A1 en mode structuré → vérifier bold, color #BF0041 ; basculer en mode JSON → vérifier toutes les propriétés avec sources

## 6. Nettoyage et CI

- [x] 6.1 Supprimer `src/utils/colorUtils.ts` si plus utilisé (remplacé par la conversion dans `parseStyles.ts`)
- [x] 6.2 Mettre à jour ou supprimer les tests existants de `parseWorkbook` qui testaient `cell.style` (remplacer par `cell.resolvedStyle`)
- [x] 6.3 `npm test` — tous les tests passent
- [x] 6.4 `npm run build` — build propre sans erreur TypeScript
- [ ] 6.5 **[BROWSER]** Charger `financial-sample.xlsx`, naviguer les feuilles, inspecter plusieurs cellules en mode structuré et JSON — vérifier cohérence avec Excel/LibreOffice
