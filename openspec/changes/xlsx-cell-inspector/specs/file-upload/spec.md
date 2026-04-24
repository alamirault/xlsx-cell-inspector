## ADDED Requirements

### Requirement: Chargement d'un fichier Excel par sélecteur
L'application SHALL permettre à l'utilisateur de sélectionner un fichier `.xlsx` ou `.xls` via un bouton/input de type fichier.

#### Scenario: Sélection d'un fichier valide
- **WHEN** l'utilisateur clique sur le bouton de sélection et choisit un fichier `.xlsx`
- **THEN** le fichier est lu dans le navigateur et le classeur est affiché

#### Scenario: Sélection d'un fichier non-Excel
- **WHEN** l'utilisateur sélectionne un fichier d'un autre type (ex. `.pdf`, `.csv`)
- **THEN** un message d'erreur indique que seuls les fichiers `.xlsx` / `.xls` sont supportés

### Requirement: Chargement d'un fichier par drag & drop
L'application SHALL permettre de déposer un fichier Excel par glisser-déposer sur la zone d'accueil.

#### Scenario: Dépôt d'un fichier valide
- **WHEN** l'utilisateur fait glisser un fichier `.xlsx` et le dépose sur la zone de drop
- **THEN** le fichier est chargé et le classeur est affiché

#### Scenario: Survol de la zone de drop
- **WHEN** l'utilisateur survole la zone de drop avec un fichier
- **THEN** la zone affiche un état visuel d'acceptation (mise en évidence)

#### Scenario: Dépôt d'un fichier invalide
- **WHEN** l'utilisateur dépose un fichier non-Excel
- **THEN** un message d'erreur est affiché et le classeur précédent reste intact

### Requirement: Traitement côté client uniquement
L'application SHALL traiter le fichier entièrement dans le navigateur sans envoyer de données à un serveur.

#### Scenario: Absence de requête réseau lors du chargement
- **WHEN** un fichier Excel est chargé
- **THEN** aucune requête réseau vers un serveur externe n'est émise avec les données du fichier

### Requirement: Indicateur de chargement
L'application SHALL afficher un indicateur de progression pendant le parsing du fichier.

#### Scenario: Fichier volumineux en cours de traitement
- **WHEN** le parsing d'un fichier prend plus de 200 ms
- **THEN** un indicateur de chargement est visible jusqu'à la fin du parsing
