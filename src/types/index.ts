export interface CellBorderSide {
  style?: string
  color?: string
}

export interface CellBorders {
  top?: CellBorderSide
  right?: CellBorderSide
  bottom?: CellBorderSide
  left?: CellBorderSide
  diagonal?: CellBorderSide
  diagonalUp?: boolean
  diagonalDown?: boolean
}

export interface CellFont {
  name?: string
  sz?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  color?: string
}

export interface CellFill {
  patternType?: string
  fgColor?: string
  bgColor?: string
}

export interface CellAlignment {
  horizontal?: string
  vertical?: string
  wrapText?: boolean
  indent?: number
  shrinkToFit?: boolean
  textRotation?: number
}

export interface CellProtection {
  locked?: boolean
  hidden?: boolean
}

export interface CellStyle {
  font?: CellFont
  fill?: CellFill
  border?: CellBorders
  alignment?: CellAlignment
  protection?: CellProtection
  numFmt?: string
  numFmtId?: number
}

export type CellType = 'string' | 'number' | 'boolean' | 'date' | 'formula' | 'empty'

export interface CellData {
  ref: string
  rawValue: string | number | boolean | Date | null
  formattedValue: string
  type: CellType
  formula?: string
  style?: CellStyle
}

export interface ColumnInfo {
  index: number
  letter: string
  width: number
  widthPx: number
}

export interface RowInfo {
  index: number
  height: number
  heightPx: number
}

export interface SheetData {
  name: string
  cells: Record<string, CellData>
  rowCount: number
  colCount: number
  columns: ColumnInfo[]
  rows: RowInfo[]
  range: string
}

export interface WorkbookData {
  sheets: SheetData[]
  activeSheetIndex: number
}

export interface SelectedCell {
  ref: string
  rowIndex: number
  colIndex: number
  sheetIndex: number
}
