import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CellInspector } from '../../components/CellInspector/CellInspector'
import { makeCell, makeSheet } from '../factories'

const sheet = makeSheet()

describe('CellInspector — sans cellule sélectionnée', () => {
  it("affiche un message d'invite", () => {
    render(<CellInspector cell={null} cellRef={null} sheet={null} />)
    expect(screen.getByText(/cliquez sur une cellule/i)).toBeInTheDocument()
  })

  it("n'affiche aucune section", () => {
    render(<CellInspector cell={null} cellRef={null} sheet={null} />)
    expect(screen.queryByText('Valeur')).not.toBeInTheDocument()
  })
})

describe('CellInspector — référence de cellule', () => {
  it('affiche la référence B4 en en-tête', () => {
    const cell = makeCell('B4', { rawValue: 'test', formattedValue: 'test', type: 'string' })
    render(<CellInspector cell={cell} cellRef="B4" sheet={sheet} />)
    expect(screen.getByText('B4')).toBeInTheDocument()
  })
})

describe('CellInspector — section Valeur', () => {
  it('affiche le type number pour une cellule numérique', () => {
    const cell = makeCell('C2', { rawValue: 42, formattedValue: '42', type: 'number' })
    render(<CellInspector cell={cell} cellRef="C2" sheet={sheet} />)
    expect(screen.getByText('number')).toBeInTheDocument()
  })

  it("affiche la formule quand présente", () => {
    const cell = makeCell('A1', {
      rawValue: 100,
      formattedValue: '100',
      type: 'formula',
      formula: 'SUM(B1:B10)',
    })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)
    expect(screen.getByText(/SUM\(B1:B10\)/)).toBeInTheDocument()
  })
})

describe('CellInspector — section Police', () => {
  it('affiche la couleur hex et le swatch', () => {
    const cell = makeCell('A1', {
      rawValue: 'hello',
      formattedValue: 'hello',
      type: 'string',
      style: { font: { color: '#FF0000', bold: true } },
    })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)
    expect(screen.getByText('#FF0000')).toBeInTheDocument()
    expect(screen.getByLabelText('Couleur #FF0000')).toBeInTheDocument()
  })
})

describe('CellInspector — section Bordures', () => {
  it('liste les 4 côtés avec style et couleur', () => {
    const cell = makeCell('A1', {
      rawValue: 'x',
      formattedValue: 'x',
      type: 'string',
      style: {
        border: {
          top: { style: 'thin', color: '#000000' },
          right: { style: 'thin', color: '#000000' },
          bottom: { style: 'medium', color: '#000000' },
          left: { style: 'thin', color: '#000000' },
        },
      },
    })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)
    expect(screen.getByText('top')).toBeInTheDocument()
    expect(screen.getByText('right')).toBeInTheDocument()
    expect(screen.getByText('bottom')).toBeInTheDocument()
    expect(screen.getByText('left')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
  })
})

describe('CellInspector — section Alignement', () => {
  it('affiche wrapText activé', () => {
    const cell = makeCell('A1', {
      rawValue: 'text',
      formattedValue: 'text',
      type: 'string',
      style: { alignment: { wrapText: true, horizontal: 'center' } },
    })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)
    expect(screen.getByText(/activé/i)).toBeInTheDocument()
    expect(screen.getByText('center')).toBeInTheDocument()
  })
})

describe('CellInspector — sections vides', () => {
  it('affiche "Aucune propriété définie" pour Police si pas de style font', () => {
    const cell = makeCell('A1', { rawValue: null, formattedValue: '', type: 'empty' })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)
    const emptyMsgs = screen.getAllByText(/aucune propriété définie/i)
    expect(emptyMsgs.length).toBeGreaterThan(0)
  })
})

describe('CellInspector — accordéon', () => {
  it('plie/déplie une section au clic sur le titre', async () => {
    const cell = makeCell('A1', { rawValue: 'x', formattedValue: 'x', type: 'string' })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)

    const summaries = screen.getAllByText('Valeur')
    const summary = summaries[0]
    const details = summary.closest('details') as HTMLDetailsElement
    expect(details.open).toBe(true)

    await userEvent.click(summary)
    expect(details.open).toBe(false)

    await userEvent.click(summary)
    expect(details.open).toBe(true)
  })
})
