## ADDED Requirements

### Requirement: JSON-like view mode in CellInspector
The CellInspector SHALL offer a second display mode — the JSON-like view — that renders the complete `ResolvedStyle` as a structured property tree. Every property present in the resolved style SHALL appear; no field is omitted.

#### Scenario: JSON view shows all resolved properties
- **WHEN** a cell with bold font, fill color, and alignment is selected and JSON view is active
- **THEN** all three groups (font, fill, alignment) appear with all their properties and values visible

#### Scenario: JSON view shows source annotation per property
- **WHEN** a property is rendered in JSON view
- **THEN** each property line displays its source identifier (e.g., `· font[4]`) alongside the value

#### Scenario: JSON view for cell with no style
- **WHEN** a cell with no style data is selected and JSON view is active
- **THEN** an empty object `{}` or "Aucune donnée de style" message is shown

### Requirement: Global toggle between structured and JSON view
The system SHALL provide a single toggle control (button or tab) visible in the CellInspector header that switches between the structured named-sections mode and the JSON-like mode. The selected mode SHALL persist for the duration of the browser session (React state, not localStorage).

#### Scenario: Toggle switches from structured to JSON
- **WHEN** the user clicks the toggle while in structured mode
- **THEN** the inspector switches to JSON-like mode and named sections are no longer visible

#### Scenario: Toggle switches from JSON to structured
- **WHEN** the user clicks the toggle while in JSON mode
- **THEN** the inspector switches back to structured mode and the JSON tree is no longer visible

#### Scenario: Mode persists across cell selections
- **WHEN** the user selects JSON mode then clicks a different cell
- **THEN** the new cell's data is displayed in JSON mode (mode is not reset on cell change)

### Requirement: JSON view groups are collapsible
The top-level groups in the JSON view (font, fill, border, alignment, protection, numFmt) SHALL be individually collapsible/expandable using native `<details>`/`<summary>` elements, defaulting to open.

#### Scenario: Collapsing a group
- **WHEN** the user clicks a group header in JSON view
- **THEN** the group's properties are hidden and a collapsed indicator is shown

#### Scenario: Expanding a collapsed group
- **WHEN** the user clicks a collapsed group header
- **THEN** the group's properties become visible again
