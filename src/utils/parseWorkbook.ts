import * as XLSX from 'xlsx'
import type {
  WorkbookData,
  SheetData,
  CellData,
  CellStyle,
  CellType,
  ColumnInfo,
  RowInfo,
} from '../types'
import { colIndexToLetter, cellRefFromIndexes } from './cellRef'
import { colWidthToPx, rowHeightToPx, defaultColWidthPx, defaultRowHeightPx } from './units'
import { xlsxColorToHex } from './colorUtils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStyle(raw: any): CellStyle | undefined {
  if (!raw) return undefined
  const style: CellStyle = {}

  // SheetJS can produce two formats for cell.s:
  // - nested: { font: {...}, fill: {...}, border: {...} }
  // - flat:   { patternType, fgColor, bgColor, bold, ... } (props directly on cell.s)
  const fontSrc = raw.font ?? (raw.bold !== undefined || raw.italic !== undefined || raw.name !== undefined || raw.sz !== undefined ? raw : null)
  if (fontSrc) {
    style.font = {
      name: fontSrc.name,
      sz: fontSrc.sz,
      bold: fontSrc.bold,
      italic: fontSrc.italic,
      underline: fontSrc.underline,
      strike: fontSrc.strike,
      color: xlsxColorToHex(fontSrc.color),
    }
  }

  const fillSrc = raw.fill ?? (raw.patternType !== undefined ? raw : null)
  if (fillSrc && fillSrc.patternType !== 'none') {
    style.fill = {
      patternType: fillSrc.patternType,
      fgColor: xlsxColorToHex(fillSrc.fgColor),
      bgColor: xlsxColorToHex(fillSrc.bgColor),
    }
  }

  const borderSrc = raw.border ?? (raw.top !== undefined || raw.left !== undefined || raw.right !== undefined || raw.bottom !== undefined ? raw : null)
  if (borderSrc) {
    style.border = {
      top: borderSrc.top
        ? { style: borderSrc.top.style, color: xlsxColorToHex(borderSrc.top.color) }
        : undefined,
      right: borderSrc.right
        ? { style: borderSrc.right.style, color: xlsxColorToHex(borderSrc.right.color) }
        : undefined,
      bottom: borderSrc.bottom
        ? { style: borderSrc.bottom.style, color: xlsxColorToHex(borderSrc.bottom.color) }
        : undefined,
      left: borderSrc.left
        ? { style: borderSrc.left.style, color: xlsxColorToHex(borderSrc.left.color) }
        : undefined,
      diagonal: borderSrc.diagonal
        ? { style: borderSrc.diagonal.style, color: xlsxColorToHex(borderSrc.diagonal.color) }
        : undefined,
      diagonalUp: borderSrc.diagonalUp,
      diagonalDown: borderSrc.diagonalDown,
    }
  }

  const alignSrc = raw.alignment ?? (raw.horizontal !== undefined || raw.vertical !== undefined || raw.wrapText !== undefined ? raw : null)
  if (alignSrc) {
    style.alignment = {
      horizontal: alignSrc.horizontal,
      vertical: alignSrc.vertical,
      wrapText: alignSrc.wrapText,
      indent: alignSrc.indent,
      shrinkToFit: alignSrc.shrinkToFit,
      textRotation: alignSrc.textRotation,
    }
  }

  const protSrc = raw.protection ?? (raw.locked !== undefined || raw.hidden !== undefined ? raw : null)
  if (protSrc) {
    style.protection = {
      locked: protSrc.locked,
      hidden: protSrc.hidden,
    }
  }

  if (raw.numFmt !== undefined) {
    style.numFmt = typeof raw.numFmt === 'string' ? raw.numFmt : XLSX.SSF.get_table()[raw.numFmt]
    style.numFmtId = typeof raw.numFmt === 'number' ? raw.numFmt : undefined
  }

  return Object.keys(style).length > 0 ? style : undefined
}

function xlsxTypeToCellType(t: string, formula?: string): CellType {
  if (formula) return 'formula'
  switch (t) {
    case 'n':
      return 'number'
    case 's':
      return 'string'
    case 'b':
      return 'boolean'
    case 'd':
      return 'date'
    case 'z':
    case 'e':
      return 'empty'
    default:
      return 'string'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSheet(ws: any, sheetName: string): SheetData {
  const ref: string = ws['!ref'] ?? 'A1'
  const range = XLSX.utils.decode_range(ref)

  const rowCount = range.e.r - range.s.r + 1
  const colCount = range.e.c - range.s.c + 1

  // Build column info
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

  // Build row info
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

  // Build cell data map
  const cells: Record<string, CellData> = {}
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = cellRefFromIndexes(r - range.s.r, c - range.s.c)
      const xlsxRef = XLSX.utils.encode_cell({ r, c })
      const cell = ws[xlsxRef]

      if (!cell) {
        cells[cellRef] = {
          ref: cellRef,
          rawValue: null,
          formattedValue: '',
          type: 'empty',
        }
        continue
      }

      const type = xlsxTypeToCellType(cell.t ?? 's', cell.f)
      const style = extractStyle(cell.s)
      // SheetJS stores the number format on cell.z (separate from the style object)
      if (cell.z && cell.z !== 'General') {
        const mergedStyle = style ?? {}
        if (!mergedStyle.numFmt) mergedStyle.numFmt = cell.z
        cells[cellRef] = {
          ref: cellRef,
          rawValue: cell.v ?? null,
          formattedValue: cell.w ?? String(cell.v ?? ''),
          type,
          formula: cell.f,
          style: mergedStyle,
        }
        continue
      }
      cells[cellRef] = {
        ref: cellRef,
        rawValue: cell.v ?? null,
        formattedValue: cell.w ?? String(cell.v ?? ''),
        type,
        formula: cell.f,
        style,
      }
    }
  }

  return {
    name: sheetName,
    cells,
    rowCount,
    colCount,
    columns,
    rows,
    range: ref,
  }
}

export function parseWorkbook(buffer: ArrayBuffer): WorkbookData {
  const wb = XLSX.read(new Uint8Array(buffer), {
    type: 'array',
    cellStyles: true,
    cellFormula: true,
    cellDates: true,
    cellNF: true,
  })

  const sheets: SheetData[] = wb.SheetNames.map((name) => parseSheet(wb.Sheets[name], name))

  return { sheets, activeSheetIndex: 0 }
}
