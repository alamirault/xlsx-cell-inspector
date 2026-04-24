## ADDED Requirements

### Requirement: Sélection d'une cellule
L'application SHALL permettre à l'utilisateur de cliquer sur n'importe quelle cellule de la grille pour la sélectionner.

#### Scenario: Clic sur une cellule
- **WHEN** l'utilisateur clique sur une cellule
- **THEN** la cellule est mise en évidence visuellement et le panneau d'inspection s'ouvre avec ses propriétés

#### Scenario: Changement de sélection
- **WHEN** l'utilisateur clique sur une autre cellule
- **THEN** le panneau d'inspection se met à jour avec les propriétés de la nouvelle cellule

### Requirement: Affichage des propriétés de valeur
Le panneau SHALL afficher les informations relatives à la valeur de la cellule.

#### Scenario: Cellule avec valeur
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche : valeur brute, valeur formatée, type de donnée (string / number / boolean / date / formula / empty)

#### Scenario: Cellule avec formule
- **WHEN** une cellule contient une formule
- **THEN** le panneau affiche la formule (ex. `=SUM(A1:A10)`) et la valeur calculée si disponible

### Requirement: Affichage des propriétés de style
Le panneau SHALL afficher toutes les propriétés de style de la cellule.

#### Scenario: Propriétés de police
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche : nom de police, taille, gras, italique, souligné, barré, couleur de police (hex)

#### Scenario: Propriétés de remplissage
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche : type de remplissage (solid/pattern/none), couleur de fond (hex), couleur de motif (hex) si applicable

#### Scenario: Propriétés de bordures
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche pour chaque côté (top, right, bottom, left, diagonal) : style de trait (thin/medium/thick/dashed/etc.) et couleur (hex)

### Requirement: Affichage des propriétés d'alignement
Le panneau SHALL afficher les propriétés d'alignement de la cellule.

#### Scenario: Alignement horizontal et vertical
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche : alignement horizontal (left/center/right/fill/justify/general), alignement vertical (top/middle/bottom)

#### Scenario: Word wrap et retrait
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche : word wrap activé/désactivé, indent level, shrink-to-fit, text rotation (degrés)

### Requirement: Affichage du format numérique
Le panneau SHALL afficher le format numérique (numFmt) appliqué à la cellule.

#### Scenario: Cellule avec format personnalisé
- **WHEN** une cellule a un format numérique défini
- **THEN** le panneau affiche le code de format (ex. `#,##0.00`, `dd/mm/yyyy`, `0%`) et l'identifiant numFmtId

#### Scenario: Cellule sans format spécifique
- **WHEN** une cellule utilise le format général
- **THEN** le panneau indique `General (id: 0)`

### Requirement: Affichage des dimensions de la colonne et de la ligne
Le panneau SHALL afficher les dimensions de la colonne et de la ligne de la cellule sélectionnée.

#### Scenario: Largeur de colonne
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche la largeur de la colonne en unités Excel (character width) et en pixels approximatifs

#### Scenario: Hauteur de ligne
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche la hauteur de la ligne en points et en pixels approximatifs

### Requirement: Affichage des propriétés de protection
Le panneau SHALL afficher les propriétés de protection de la cellule.

#### Scenario: Cellule protégée
- **WHEN** une cellule est sélectionnée
- **THEN** le panneau affiche : locked (oui/non), hidden (oui/non)

### Requirement: Organisation en sections groupées
Le panneau SHALL organiser les propriétés en sections pliables/dépliables par domaine.

#### Scenario: Sections disponibles
- **WHEN** le panneau est ouvert
- **THEN** les propriétés sont regroupées en sections : Valeur, Police, Remplissage, Bordures, Alignement, Format, Dimensions, Protection

#### Scenario: Section sans donnée
- **WHEN** une cellule n'a pas de propriétés dans une section (ex. pas de bordures définies)
- **THEN** la section l'indique clairement (ex. "Aucune bordure définie") plutôt que d'être masquée
