const DEFAULT_CHAR_WIDTH_PX = 7
const CHAR_WIDTH_PADDING_PX = 5
const POINTS_TO_PX = 96 / 72
const DEFAULT_COL_WIDTH_PX = 64
const DEFAULT_ROW_HEIGHT_PX = 20

export function colWidthToPx(charWidth: number): number {
  if (charWidth <= 0) return 0
  return Math.round(charWidth * DEFAULT_CHAR_WIDTH_PX + CHAR_WIDTH_PADDING_PX)
}

export function rowHeightToPx(points: number): number {
  if (points <= 0) return 0
  return Math.round(points * POINTS_TO_PX)
}

export function defaultColWidthPx(): number {
  return DEFAULT_COL_WIDTH_PX
}

export function defaultRowHeightPx(): number {
  return DEFAULT_ROW_HEIGHT_PX
}
