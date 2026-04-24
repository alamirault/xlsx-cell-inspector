## ADDED Requirements

### Requirement: Parse xl/styles.xml from ZIP archive
The system SHALL read `xl/styles.xml` directly from the xlsx ZIP buffer using `fflate` and parse it with `DOMParser` to build a `StylesIndex` containing all font, fill, border, numFmt, and cellXfs definitions.

#### Scenario: Styles successfully parsed
- **WHEN** a valid xlsx file is loaded
- **THEN** the worker produces a `StylesIndex` with arrays for fonts, fills, borders, numFmts, and cellXfs matching the counts declared in `xl/styles.xml`

#### Scenario: styles.xml is missing from ZIP
- **WHEN** an xlsx file has no `xl/styles.xml` entry
- **THEN** the worker returns an empty `StylesIndex` and no error is thrown

### Requirement: Resolve full cell style by index
The system SHALL resolve a cell's integer style index into a `ResolvedStyle` by following the chain: `cellXfs[index]` → `fonts[fontId]` + `fills[fillId]` + `borders[borderId]` + inline `alignment` + inline `protection` + `numFmts[numFmtId]`.

#### Scenario: Cell with font, fill, and alignment
- **WHEN** a cell has style index pointing to an xf with fontId, fillId, and inline alignment
- **THEN** `ResolvedStyle` contains all font properties (bold, size, color, name…), fill properties (pattern, fgColor, bgColor), and alignment properties (horizontal, vertical, wrapText…)

#### Scenario: Cell with default style (index 0)
- **WHEN** a cell has style index 0 or no s attribute
- **THEN** `ResolvedStyle` reflects the default xf (typically empty font/fill/border) without throwing

### Requirement: Annotate each resolved property with its source
Every property in `ResolvedStyle` SHALL carry a `source` field identifying the element index it came from (e.g., `"font[4]"`, `"fill[2]"`, `"xf[1]"`).

#### Scenario: Font property source
- **WHEN** bold is resolved from font definition at index 4
- **THEN** `resolvedStyle.font.bold.source.element === "font[4]"`

#### Scenario: Alignment property source
- **WHEN** horizontal alignment is defined inline in the xf element at index 1
- **THEN** `resolvedStyle.alignment.horizontal.source.element === "xf[1]"`

### Requirement: Handle theme and indexed colors without crashing
The system SHALL preserve theme colors and indexed colors as string descriptors (e.g., `"theme:1 tint:-0.25"`, `"indexed:9"`) rather than converting them to hex, since full theme resolution requires `xl/theme/theme1.xml` which is out of scope.

#### Scenario: Theme color on font
- **WHEN** a font uses `<color theme="1" tint="-0.25"/>`
- **THEN** `resolvedStyle.font.color.value === "theme:1 tint:-0.25"` and no error is thrown

#### Scenario: RGB color on fill
- **WHEN** a fill uses `<fgColor rgb="FF00A933"/>`
- **THEN** `resolvedStyle.fill.fgColor.value === "#00A933"` (ARGB stripped to RGB hex)
