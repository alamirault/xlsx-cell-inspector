export interface ResolvedProperty<T> {
  value: T
  source: { element: string }
}

export interface ResolvedFont {
  bold?: ResolvedProperty<boolean>
  italic?: ResolvedProperty<boolean>
  underline?: ResolvedProperty<boolean>
  strike?: ResolvedProperty<boolean>
  size?: ResolvedProperty<number>
  name?: ResolvedProperty<string>
  family?: ResolvedProperty<number>
  color?: ResolvedProperty<string>
  charset?: ResolvedProperty<number>
  vertAlign?: ResolvedProperty<string>
}

export interface ResolvedFill {
  patternType?: ResolvedProperty<string>
  fgColor?: ResolvedProperty<string>
  bgColor?: ResolvedProperty<string>
}

export interface ResolvedBorderSide {
  style?: ResolvedProperty<string>
  color?: ResolvedProperty<string>
}

export interface ResolvedBorder {
  top?: ResolvedBorderSide
  right?: ResolvedBorderSide
  bottom?: ResolvedBorderSide
  left?: ResolvedBorderSide
  diagonal?: ResolvedBorderSide
  diagonalUp?: ResolvedProperty<boolean>
  diagonalDown?: ResolvedProperty<boolean>
}

export interface ResolvedAlignment {
  horizontal?: ResolvedProperty<string>
  vertical?: ResolvedProperty<string>
  wrapText?: ResolvedProperty<boolean>
  indent?: ResolvedProperty<number>
  shrinkToFit?: ResolvedProperty<boolean>
  textRotation?: ResolvedProperty<number>
}

export interface ResolvedProtection {
  locked?: ResolvedProperty<boolean>
  hidden?: ResolvedProperty<boolean>
}

export interface ResolvedStyle {
  font?: ResolvedFont
  fill?: ResolvedFill
  border?: ResolvedBorder
  alignment?: ResolvedAlignment
  protection?: ResolvedProtection
  numFmt?: ResolvedProperty<string>
  numFmtId?: ResolvedProperty<number>
}

export type CellType = 'string' | 'number' | 'boolean' | 'date' | 'formula' | 'empty'

export interface CellData {
  ref: string
  rawValue: string | number | boolean | Date | null
  formattedValue: string
  type: CellType
  formula?: string
  resolvedStyle?: ResolvedStyle
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
