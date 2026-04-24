import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpreadsheetGrid } from '../../components/SpreadsheetGrid/SpreadsheetGrid'
import { makeSheet, makeCell } from '../factories'

// react-virtual needs element sizing — mock scrollHeight/offsetWidth
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 400 })
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 })
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 400 })
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 800 })
})

function buildSheet() {
  return makeSheet({
    colCount: 3,
    rowCount: 3,
    cells: {
      A1: makeCell('A1', { rawValue: 'Titre', formattedValue: 'Titre', type: 'string' }),
      B2: makeCell('B2', {
        rawValue: 42,
        formattedValue: '42',
        type: 'number',
        resolvedStyle: {
          fill: { fgColor: { value: '#FF0000', source: { element: 'fill[1]' } } },
          font: { bold: { value: true, source: { element: 'font[1]' } } },
        },
      }),
    },
  })
}

describe('SpreadsheetGrid — en-têtes', () => {
  it('affiche les en-têtes de colonnes A, B, C', () => {
    render(
      <SpreadsheetGrid
        sheet={buildSheet()}
        sheetIndex={0}
        selectedCell={null}
        onCellClick={vi.fn()}
      />,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('affiche les numéros de lignes 1, 2, 3', () => {
    render(
      <SpreadsheetGrid
        sheet={buildSheet()}
        sheetIndex={0}
        selectedCell={null}
        onCellClick={vi.fn()}
      />,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

describe('SpreadsheetGrid — rendu des cellules', () => {
  it('affiche la valeur formatée de la cellule A1', () => {
    render(
      <SpreadsheetGrid
        sheet={buildSheet()}
        sheetIndex={0}
        selectedCell={null}
        onCellClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Titre')).toBeInTheDocument()
  })

  it('applique backgroundColor rouge à la cellule B2', () => {
    render(
      <SpreadsheetGrid
        sheet={buildSheet()}
        sheetIndex={0}
        selectedCell={null}
        onCellClick={vi.fn()}
      />,
    )
    // Find the cell by value
    const cell42 = screen.getByText('42').closest('[style]')
    expect(cell42).toHaveStyle({ backgroundColor: '#FF0000' })
  })

  it('applique font-weight:bold à la cellule B2', () => {
    render(
      <SpreadsheetGrid
        sheet={buildSheet()}
        sheetIndex={0}
        selectedCell={null}
        onCellClick={vi.fn()}
      />,
    )
    const cell42 = screen.getByText('42').closest('[style]')
    expect(cell42).toHaveStyle({ fontWeight: 'bold' })
  })
})

describe('SpreadsheetGrid — sélection', () => {
  it('appelle onCellClick avec les bonnes coordonnées', async () => {
    const onCellClick = vi.fn()
    render(
      <SpreadsheetGrid
        sheet={buildSheet()}
        sheetIndex={0}
        selectedCell={null}
        onCellClick={onCellClick}
      />,
    )
    await userEvent.click(screen.getByText('Titre'))
    expect(onCellClick).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'A1', sheetIndex: 0 }),
    )
  })
})
