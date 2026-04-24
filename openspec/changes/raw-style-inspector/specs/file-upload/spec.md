## MODIFIED Requirements

### Requirement: Worker parses styles alongside cell values
The Web Worker SHALL parse `xl/styles.xml` from the xlsx ZIP and resolve all cell style indices during workbook loading, producing a complete `StylesIndex` that is included in the `WorkbookData` returned to the main thread. SheetJS SHALL be called without `cellStyles: true` so that `cell.s` remains as an integer index for our own resolver.

#### Scenario: WorkbookData includes resolved styles
- **WHEN** the worker finishes parsing a valid xlsx file
- **THEN** each `CellData` in the result has a `resolvedStyle` field populated from the `StylesIndex`

#### Scenario: Worker handles xlsx without styles gracefully
- **WHEN** the xlsx file has no `xl/styles.xml`
- **THEN** the worker still returns valid `WorkbookData` with `resolvedStyle: undefined` on all cells and no error
