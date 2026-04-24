## ADDED Requirements

### Requirement: Navigation entre les feuilles
L'application SHALL afficher un onglet par feuille du classeur et permettre de naviguer entre elles.

#### Scenario: Classeur multi-feuilles
- **WHEN** un classeur contenant plusieurs feuilles est chargé
- **THEN** les noms des feuilles sont affichés sous forme d'onglets cliquables

#### Scenario: Changement de feuille active
- **WHEN** l'utilisateur clique sur l'onglet d'une feuille
- **THEN** la grille affiche le contenu de cette feuille

### Requirement: Affichage des données en grille
L'application SHALL afficher le contenu de la feuille active dans une grille avec en-têtes de colonnes (A, B, C…) et numéros de lignes (1, 2, 3…).

#### Scenario: Rendu des cellules avec valeur
- **WHEN** une feuille est affichée
- **THEN** chaque cellule contenant une valeur affiche sa valeur formatée (telle que vue dans Excel)

#### Scenario: Rendu des cellules vides
- **WHEN** une cellule ne contient pas de valeur
- **THEN** la cellule est affichée vide sans erreur

### Requirement: Respect des dimensions colonnes/lignes
L'application SHALL afficher les largeurs de colonnes et hauteurs de lignes en proportions fidèles aux valeurs définies dans le fichier.

#### Scenario: Colonne avec largeur personnalisée
- **WHEN** une colonne a une largeur définie dans le fichier XLSX
- **THEN** la colonne est affichée avec une largeur proportionnellement correcte par rapport aux autres colonnes

#### Scenario: Ligne avec hauteur personnalisée
- **WHEN** une ligne a une hauteur définie dans le fichier XLSX
- **THEN** la ligne est affichée avec une hauteur proportionnellement correcte

### Requirement: Virtualisation pour grands tableaux
L'application SHALL rester fluide pour des feuilles contenant jusqu'à 10 000 lignes et 200 colonnes.

#### Scenario: Navigation dans un grand tableau
- **WHEN** l'utilisateur fait défiler une feuille de 10 000 lignes
- **THEN** le rendu reste fluide (pas de blocage du thread principal)

### Requirement: Application des styles visuels de base
L'application SHALL appliquer les styles visuels de base des cellules dans la grille : couleur de fond, couleur de texte, gras, italique, souligné.

#### Scenario: Cellule avec fond coloré
- **WHEN** une cellule a une couleur de fond définie
- **THEN** la grille affiche cette couleur de fond dans la cellule

#### Scenario: Cellule avec texte en gras
- **WHEN** une cellule a le style gras activé
- **THEN** le texte est rendu en gras dans la grille
