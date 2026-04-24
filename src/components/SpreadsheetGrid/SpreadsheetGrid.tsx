import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SheetData, SelectedCell } from '../../types'
import { colIndexToLetter } from '../../utils/cellRef'
import styles from './SpreadsheetGrid.module.css'

const ROW_HEADER_WIDTH = 50
const COL_HEADER_HEIGHT = 24

interface Props {
  sheet: SheetData
  sheetIndex: number
  selectedCell: SelectedCell | null
  onCellClick: (cell: SelectedCell) => void
}

export function SpreadsheetGrid({ sheet, sheetIndex, selectedCell, onCellClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: sheet.rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => sheet.rows[i]?.heightPx ?? 20,
    overscan: 5,
  })

  const colVirtualizer = useVirtualizer({
    count: sheet.colCount,
    horizontal: true,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => sheet.columns[i]?.widthPx ?? 64,
    overscan: 3,
  })

  const totalWidth = colVirtualizer.getTotalSize() + ROW_HEADER_WIDTH
  const totalHeight = rowVirtualizer.getTotalSize() + COL_HEADER_HEIGHT

  return (
    <div className={styles.wrapper}>
      {/* Corner cell */}
      <div
        className={styles.cornerCell}
        style={{ width: ROW_HEADER_WIDTH, height: COL_HEADER_HEIGHT }}
      />

      {/* Column headers — scroll horizontally with grid */}
      <div className={styles.colHeadersOuter} style={{ left: ROW_HEADER_WIDTH }}>
        <div className={styles.colHeadersInner} style={{ width: totalWidth - ROW_HEADER_WIDTH }}>
          {colVirtualizer.getVirtualItems().map((vc) => (
            <div
              key={vc.key}
              className={styles.colHeader}
              style={{
                position: 'absolute',
                left: vc.start,
                width: vc.size,
                height: COL_HEADER_HEIGHT,
              }}
            >
              {colIndexToLetter(sheet.columns[vc.index]?.index ?? vc.index)}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        className={styles.scroll}
        style={{ top: COL_HEADER_HEIGHT, left: ROW_HEADER_WIDTH }}
      >
        {/* Row headers */}
        <div
          className={styles.rowHeadersOuter}
          style={{ width: ROW_HEADER_WIDTH, height: totalHeight - COL_HEADER_HEIGHT }}
        >
          {rowVirtualizer.getVirtualItems().map((vr) => (
            <div
              key={vr.key}
              className={styles.rowHeader}
              style={{
                position: 'absolute',
                top: vr.start,
                height: vr.size,
                width: ROW_HEADER_WIDTH,
              }}
            >
              {sheet.rows[vr.index]?.index + 1}
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div
          className={styles.gridArea}
          style={{
            width: totalWidth - ROW_HEADER_WIDTH,
            height: totalHeight - COL_HEADER_HEIGHT,
            left: ROW_HEADER_WIDTH,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((vr) =>
            colVirtualizer.getVirtualItems().map((vc) => {
              const rowIdx = vr.index
              const colIdx = vc.index
              const col = sheet.columns[colIdx]
              const row = sheet.rows[rowIdx]
              if (!col || !row) return null

              const cellRef = `${colIndexToLetter(col.index)}${row.index + 1}`
              const cell = sheet.cells[cellRef]
              const isSelected =
                selectedCell?.ref === cellRef && selectedCell.sheetIndex === sheetIndex

              const cellStyle = cell?.style
              const font = cellStyle?.font
              const fill = cellStyle?.fill
              const border = cellStyle?.border
              const alignment = cellStyle?.alignment

              const bgColor = fill?.fgColor
              const color = font?.color
              const fontWeight = font?.bold ? 'bold' : undefined
              const fontStyle = font?.italic ? 'italic' : undefined
              const tdParts: string[] = []
              if (font?.underline) tdParts.push('underline')
              if (font?.strike) tdParts.push('line-through')
              const textDecoration = tdParts.length ? tdParts.join(' ') : undefined
              const fontSize = font?.sz ? `${font.sz}pt` : undefined
              const fontFamily = font?.name
              const textAlign = alignment?.horizontal as React.CSSProperties['textAlign']
              const whiteSpace = alignment?.wrapText ? 'normal' : undefined
              const alignItems =
                alignment?.vertical === 'center' ? 'center'
                : alignment?.vertical === 'top' ? 'flex-start'
                : alignment?.vertical === 'bottom' ? 'flex-end'
                : undefined

              const borderStyleMap: Record<string, string> = { thin: '1px', medium: '2px', thick: '3px', dashed: '1px', dotted: '1px', double: '3px' }
              const makeBorder = (side: typeof border extends undefined ? never : NonNullable<typeof border>['top']) =>
                side?.style ? `${borderStyleMap[side.style] ?? '1px'} solid ${side.color ?? '#000'}` : undefined

              return (
                <div
                  key={`${vr.key}-${vc.key}`}
                  className={`${styles.cell} ${isSelected ? styles.selected : ''}`}
                  style={{
                    position: 'absolute',
                    top: vr.start,
                    left: vc.start,
                    width: vc.size,
                    height: vr.size,
                    backgroundColor: bgColor,
                    color,
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    fontSize,
                    fontFamily,
                    textAlign,
                    whiteSpace,
                    alignItems,
                    borderTop: makeBorder(border?.top),
                    borderRight: makeBorder(border?.right),
                    borderBottom: makeBorder(border?.bottom),
                    borderLeft: makeBorder(border?.left),
                  }}
                  onClick={() =>
                    onCellClick({
                      ref: cellRef,
                      rowIndex: rowIdx,
                      colIndex: colIdx,
                      sheetIndex,
                    })
                  }
                  title={cellRef}
                >
                  <span className={styles.cellText}>{cell?.formattedValue ?? ''}</span>
                </div>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}
