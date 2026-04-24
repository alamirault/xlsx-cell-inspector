import type { CellData, SheetData, WorkbookData, ColumnInfo, RowInfo } from '../types'

export function makeColumn(index: number, widthPx = 80): ColumnInfo {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return { index, letter: letters[index] ?? 'A', width: 8.43, widthPx }
}

export function makeRow(index: number, heightPx = 20): RowInfo {
  return { index, height: 15, heightPx }
}

export function makeCell(ref: string, overrides: Partial<CellData> = {}): CellData {
  return {
    ref,
    rawValue: null,
    formattedValue: '',
    type: 'empty',
    ...overrides,
  }
}

export function makeSheet(overrides: Partial<SheetData> = {}): SheetData {
  const colCount = overrides.colCount ?? 3
  const rowCount = overrides.rowCount ?? 3
  return {
    name: 'Sheet1',
    cells: {},
    rowCount,
    colCount,
    columns: Array.from({ length: colCount }, (_, i) => makeColumn(i)),
    rows: Array.from({ length: rowCount }, (_, i) => makeRow(i)),
    range: 'A1:C3',
    ...overrides,
  }
}

export function makeWorkbook(sheets: SheetData[] = [makeSheet()]): WorkbookData {
  return { sheets, activeSheetIndex: 0 }
}
