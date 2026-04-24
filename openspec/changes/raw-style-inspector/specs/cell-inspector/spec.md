## MODIFIED Requirements

### Requirement: Display complete cell style in named sections
The CellInspector SHALL display all OOXML properties for the selected cell in named sections (Valeur, Police, Remplissage, Bordures, Alignement, Format numérique, Dimensions, Protection). Properties SHALL be sourced from the fully resolved `ResolvedStyle` produced by `ooxml-style-resolution`, not from SheetJS `cell.s`.

#### Scenario: Font section shows all resolved font properties
- **WHEN** a cell has bold, a custom color, and a named font in its resolved style
- **THEN** the Police section displays bold status, color hex with swatch, and font name

#### Scenario: Fill section shows resolved fill properties
- **WHEN** a cell has a solid fill with fgColor in its resolved style
- **THEN** the Remplissage section displays the pattern type and fgColor hex with swatch

#### Scenario: Alignment section shows all resolved alignment properties
- **WHEN** a cell has horizontal, vertical, and wrapText in its resolved style
- **THEN** the Alignement section displays all three values

#### Scenario: Empty section when no properties defined
- **WHEN** a resolved style has no border definitions
- **THEN** the Bordures section displays "Aucune propriété définie"
