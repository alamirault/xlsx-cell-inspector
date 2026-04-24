## Why

SheetJS silently drops cell style data during parsing — for a cell with bold text, a custom font color, and alignment, `cell.s` returns only the fill properties. The font, alignment, and protection are lost before we ever see them. Our hand-mapped `CellStyle` type compounds the problem: any OOXML property we didn't think to add is gone forever. Developers using this tool to verify their generated Excel files cannot trust the inspector.

## What Changes

- Replace SheetJS style reading with direct parsing of `xl/styles.xml` from the xlsx ZIP
- Resolve the full OOXML style chain (xf → font/fill/border/alignment/protection/numFmt) ourselves
- Each resolved property is annotated with its source index (e.g., `font[4]`, `fill[2]`, `xf[1]`)
- CellInspector gains a second mode: **JSON-like view** — a structured tree of all resolved properties with source annotations, toggled globally via a button
- The existing named sections (Police, Remplissage, Bordures…) are kept but populated from the new complete resolved style, replacing the incomplete SheetJS-mapped fields
- Add `fflate` as a dependency for ZIP reading in the Web Worker

## Capabilities

### New Capabilities

- `ooxml-style-resolution`: Parse `xl/styles.xml` directly, resolve the full font/fill/border/alignment/protection/numFmt for a cell's style index, and annotate each property with its source element index in the stylesheet
- `raw-style-view`: JSON-like inspector mode showing the complete resolved style as a property tree with source annotations, toggled globally alongside the existing named-section view

### Modified Capabilities

- `cell-inspector`: Sections now populated from the fully resolved OOXML style instead of the incomplete SheetJS `cell.s` mapping; gains the mode toggle
- `file-upload`: Worker now also parses `xl/styles.xml` and `xl/worksheets/sheet*.xml` style indices in addition to calling `XLSX.read()`

## Impact

- **New dependency**: `fflate` (ZIP decompression, ~14KB gzipped) used in the Web Worker
- **`src/workers/parser.worker.ts`**: extended to unzip and parse `styles.xml`
- **`src/utils/parseWorkbook.ts`**: `extractStyle()` replaced by lookup into resolved style index
- **`src/types/index.ts`**: `CellStyle` extended or replaced with `ResolvedStyle` carrying source metadata
- **`src/components/CellInspector/CellInspector.tsx`**: mode toggle + JSON view renderer
- **`src/tests/`**: existing style tests need updating; new tests for XML resolution
