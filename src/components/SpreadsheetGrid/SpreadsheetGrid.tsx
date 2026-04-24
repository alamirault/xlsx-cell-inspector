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
              const bgColor = cellStyle?.fill?.fgColor
              const color = cellStyle?.font?.color
              const fontWeight = cellStyle?.font?.bold ? 'bold' : undefined
              const fontStyle = cellStyle?.font?.italic ? 'italic' : undefined
              const textDecoration = cellStyle?.font?.underline ? 'underline' : undefined

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
