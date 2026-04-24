import * as XLSX from 'xlsx'
import { unzipSync } from 'fflate'
import type { WorkbookData, SheetData, CellData, CellType, ColumnInfo, RowInfo, ResolvedStyle } from '../types'
import { colIndexToLetter, cellRefFromIndexes } from './cellRef'
import { colWidthToPx, rowHeightToPx, defaultColWidthPx, defaultRowHeightPx } from './units'
import { parseStylesXml, resolveStyle, emptyStylesIndex } from './parseStyles'
import type { StylesIndex } from './parseStyles'

// ── Worksheet XML: extract cell→styleIndex map ────────────────────────────────

function parseSheetStyleIndices(wsXml: string): Record<string, number> {
  const map: Record<string, number> = {}
  // Match <c ...> elements and capture r and s attributes in any order
  const cellRe = /<c\s([^>]*)>/g
  let m: RegExpExecArray | null
  while ((m = cellRe.exec(wsXml)) !== null) {
    const attrs = m[1]
    const rM = attrs.match(/\br="([A-Z]+\d+)"/)
    const sM = attrs.match(/\bs="(\d+)"/)
    if (rM && sM) map[rM[1]] = parseInt(sM[1], 10)
  }
  return map
}

// ── Workbook relationships: sheetName → worksheet file path ──────────────────

function getSheetFilePaths(
  unzipped: ReturnType<typeof unzipSync>,
  td: TextDecoder,
): Record<string, string> {
  const result: Record<string, string> = {}
  const wbBytes = unzipped['xl/workbook.xml']
  const relsBytes = unzipped['xl/_rels/workbook.xml.rels']
  if (!wbBytes || !relsBytes) return result

  // Parse relationships: Id → Target
  const relsXml = td.decode(relsBytes)
  let doc = new DOMParser().parseFromString(relsXml, 'application/xml')
  const relsMap: Record<string, string> = {}
  Array.from(doc.getElementsByTagName('Relationship')).forEach((rel) => {
    const id = rel.getAttribute('Id')
    const target = rel.getAttribute('Target')
    if (id && target) relsMap[id] = target
  })

  // Parse sheet name → r:id from workbook.xml
  const wbXml = td.decode(wbBytes)
  doc = new DOMParser().parseFromString(wbXml, 'application/xml')
  Array.from(doc.getElementsByTagName('sheet')).forEach((sheet) => {
    const name = sheet.getAttribute('name')
    const rId =
      sheet.getAttribute('r:id') ??
      sheet.getAttributeNS(
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'id',
      )
    if (name && rId && relsMap[rId]) result[name] = relsMap[rId]
  })
  return result
}

// ── Cell type ─────────────────────────────────────────────────────────────────

function xlsxTypeToCellType(t: string, formula?: string): CellType {
  if (formula) return 'formula'
  switch (t) {
    case 'n': return 'number'
    case 's': return 'string'
    case 'b': return 'boolean'
    case 'd': return 'date'
    case 'z':
    case 'e': return 'empty'
    default: return 'string'
  }
}

// ── Sheet parser ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSheet(
  ws: any,
  sheetName: string,
  stylesIndex: StylesIndex,
  styleIndexMap: Record<string, number>,
): SheetData {
  const ref: string = ws['!ref'] ?? 'A1'
  const range = XLSX.utils.decode_range(ref)

  const rowCount = range.e.r - range.s.r + 1
  const colCount = range.e.c - range.s.c + 1

  // Column info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCols: any[] = ws['!cols'] ?? []
  const columns: ColumnInfo[] = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    const rawCol = rawCols[c]
    const wch = rawCol?.wch ?? rawCol?.width ?? 8.43
    const wpx = rawCol?.wpx
    const widthPx = wpx ? wpx : colWidthToPx(wch)
    columns.push({
      index: c,
      letter: colIndexToLetter(c),
      width: wch,
      widthPx: widthPx > 0 ? widthPx : defaultColWidthPx(),
    })
  }

  // Row info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRows: any[] = ws['!rows'] ?? []
  const rows: RowInfo[] = []
  for (let r = range.s.r; r <= range.e.r; r++) {
    const rawRow = rawRows[r]
    const hpt = rawRow?.hpt ?? rawRow?.height ?? 15
    const hpx = rawRow?.hpx
    const heightPx = hpx ? hpx : rowHeightToPx(hpt)
    rows.push({
      index: r,
      height: hpt,
      heightPx: heightPx > 0 ? heightPx : defaultRowHeightPx(),
    })
  }

  // Cells
  const cells: Record<string, CellData> = {}
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = cellRefFromIndexes(r - range.s.r, c - range.s.c)
      const xlsxRef = XLSX.utils.encode_cell({ r, c })
      const cell = ws[xlsxRef]

      if (!cell) {
        cells[cellRef] = { ref: cellRef, rawValue: null, formattedValue: '', type: 'empty' }
        continue
      }

      const type = xlsxTypeToCellType(cell.t ?? 's', cell.f)

      // Resolve style from our own XML-based index
      const styleIdx = styleIndexMap[xlsxRef]
      let resolvedStyle: ResolvedStyle | undefined =
        styleIdx !== undefined ? resolveStyle(styleIdx, stylesIndex) : undefined

      // Merge cell.z numFmt if not already set from style
      if (cell.z && cell.z !== 'General' && !resolvedStyle?.numFmt) {
        resolvedStyle = resolvedStyle ?? {}
        resolvedStyle.numFmt = { value: cell.z, source: { element: 'cell.z' } }
      }

      cells[cellRef] = {
        ref: cellRef,
        rawValue: cell.v ?? null,
        formattedValue: cell.w ?? String(cell.v ?? ''),
        type,
        formula: cell.f,
        resolvedStyle,
      }
    }
  }

  return { name: sheetName, cells, rowCount, colCount, columns, rows, range: ref }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseWorkbook(buffer: ArrayBuffer): WorkbookData {
  const bytes = new Uint8Array(buffer)
  const td = new TextDecoder()

  let stylesIndex = emptyStylesIndex()
  let sheetStyleIndexMaps: Record<string, Record<string, number>> = {}

  try {
    const unzipped = unzipSync(bytes)

    // Parse styles.xml
    const stylesBytes = unzipped['xl/styles.xml']
    if (stylesBytes) {
      stylesIndex = parseStylesXml(td.decode(stylesBytes))
    }

    // Get sheet name → worksheet file path mapping
    const filePaths = getSheetFilePaths(unzipped, td)

    // Parse s attributes from each worksheet XML
    for (const [sheetName, filePath] of Object.entries(filePaths)) {
      const key = filePath.startsWith('xl/') ? filePath : `xl/${filePath}`
      const wsBytes = unzipped[key]
      if (wsBytes) {
        sheetStyleIndexMaps[sheetName] = parseSheetStyleIndices(td.decode(wsBytes))
      }
    }
  } catch {
    // Graceful fallback: parse without styles
  }

  const wb = XLSX.read(bytes, {
    type: 'array',
    cellFormula: true,
    cellDates: true,
    cellNF: true,
  })

  const sheets: SheetData[] = wb.SheetNames.map((name) =>
    parseSheet(wb.Sheets[name], name, stylesIndex, sheetStyleIndexMaps[name] ?? {}),
  )

  return { sheets, activeSheetIndex: 0 }
}
