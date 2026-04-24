## Context

The current style pipeline goes through SheetJS which silently drops most cell style data. For a cell with style index `s=1`, SheetJS returns only fill properties and discards font, alignment, and protection. The root cause is that SheetJS resolves `cell.s` partially and inconsistently depending on the xlsx file origin.

The fix is to bypass SheetJS for style data entirely and parse `xl/styles.xml` directly. An xlsx file is a ZIP archive; we already receive the raw `ArrayBuffer` in the Web Worker, so we can unzip it without any extra I/O.

## Goals / Non-Goals

**Goals:**
- Parse `xl/styles.xml` and resolve every OOXML property for a cell's style index
- Annotate each resolved property with its source element index (`font[N]`, `fill[N]`, `xf[N]`)
- Expose a JSON-like view in CellInspector showing the complete resolved style
- Keep the existing named sections (Police, Remplissage…) but feed them from the new complete data
- Global toggle between structured and JSON-like view, persisted in React state

**Non-Goals:**
- Grid rendering improvements (separate concern)
- Theme color resolution (OOXML theme colors require `xl/theme/theme1.xml` — out of scope, shown as raw `theme:N tint:X`)
- Inherited cell styles from `cellStyleXfs` (we resolve `cellXfs` only, the direct cell style)

## Decisions

### D1 — ZIP library: fflate

`fflate` (14 KB gzipped) is chosen over `jszip` (22 KB) for its smaller size and synchronous API option. It works inside a Web Worker with no DOM dependency.

Alternative considered: `DecompressionStream` (browser native) — only handles raw DEFLATE streams, not the ZIP container format. Ruled out.

### D2 — Parse styles.xml with DOMParser

The browser's `DOMParser` is available in Workers (via `new DOMParser()` with `application/xml`). This avoids shipping an XML parser library.

Data model after parsing:

```
StylesIndex {
  fonts:    FontDef[]       // <fonts><font> elements
  fills:    FillDef[]       // <fills><fill> elements
  borders:  BorderDef[]     // <borders><border> elements
  numFmts:  NumFmtDef[]     // <numFmts><numFmt> elements
  cellXfs:  XfDef[]         // <cellXfs><xf> elements  ← style index
}
```

### D3 — Cell style index from SheetJS, not raw worksheet XML

SheetJS correctly reads the `s` attribute from each `<c>` element and exposes it via undocumented `cell['!data']` internals. Rather than re-parsing the worksheet XML ourselves, we read `cell.s` as a NUMBER (the raw index) before SheetJS replaces it with the resolved object.

Concretely: SheetJS uses `cellStyles: true` to resolve `cell.s` in-place. Without that option, `cell.s` stays as the integer index. We call `XLSX.read()` **twice**: once without `cellStyles` to capture all style indices, once with `cellStyles: true` for backward compat with existing code.

Alternative: parse `xl/worksheets/sheet*.xml` ourselves for `s` attributes. Ruled out — increases complexity and duplicates SheetJS's row/column parsing.

Actually simpler: call `XLSX.read()` once without `cellStyles: true`, capture integer `cell.s` indices into our own `cellStyleIndex` map, then resolve them against our `StylesIndex`. SheetJS still gives us values, formulas, dates. We drop `cellStyles: true`.

### D4 — ResolvedStyle type with source metadata

```typescript
interface StyleSource {
  element: string   // "font[4]" | "fill[2]" | "xf[1]" | "numFmt[165]"
}

interface ResolvedProperty<T> {
  value: T
  source: StyleSource
}

interface ResolvedStyle {
  font?: {
    bold?:      ResolvedProperty<boolean>
    italic?:    ResolvedProperty<boolean>
    underline?: ResolvedProperty<boolean>
    strike?:    ResolvedProperty<boolean>
    size?:      ResolvedProperty<number>
    name?:      ResolvedProperty<string>
    family?:    ResolvedProperty<number>
    color?:     ResolvedProperty<string>   // hex or "theme:N tint:X"
    charset?:   ResolvedProperty<number>
    vertAlign?: ResolvedProperty<string>   // superscript | subscript
  }
  fill?: { ... }
  border?: { ... }
  alignment?: { ... }
  protection?: { ... }
  numFmt?: ResolvedProperty<string>        // format code string
  numFmtId?: ResolvedProperty<number>
}
```

`CellStyle` (existing typed structure) is kept for the structured sections. It is derived from `ResolvedStyle` by extracting `.value` fields. `ResolvedStyle` is stored in `CellData` alongside or replacing the old `style` field.

### D5 — JSON view renders ResolvedStyle directly

The JSON-like view iterates `ResolvedStyle` and renders each property as `key: value · source`. No hardcoded field list — if a new property appears in the XML, it shows automatically.

## Risks / Trade-offs

- **DOMParser in Worker**: available in all modern browsers, but not available in Node.js (test environment). Tests that call the styles parser will need `jsdom` or a mock. → Mitigation: inject DOMParser as a dependency in `parseStyles.ts`; tests inject `new DOMParser()` from jsdom.

- **Double XLSX.read() call**: marginal perf hit for large files. → Mitigation: capture style indices from a single read without `cellStyles: true`; no second read needed.

- **OOXML edge cases**: some xlsx generators don't include `xl/styles.xml` or use non-standard namespaces. → Mitigation: graceful fallback to empty style if file is missing; display "No style data" in inspector.

- **fflate adds ~14 KB to the worker bundle** (gzipped). Acceptable for this use case.

## Open Questions

- Should the JSON view be collapsible per top-level key (font/fill/border…) or always fully expanded? Collapsible is more usable for complex styles but adds implementation work.
