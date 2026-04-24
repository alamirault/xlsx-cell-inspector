import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RawStyleView } from '../../components/CellInspector/RawStyleView'
import { CellInspector } from '../../components/CellInspector/CellInspector'
import { makeCell, makeSheet } from '../factories'
import type { ResolvedStyle } from '../../types'

const fullStyle: ResolvedStyle = {
  font: {
    bold: { value: true, source: { element: 'font[4]' } },
    color: { value: '#BF0041', source: { element: 'font[4]' } },
    size: { value: 11, source: { element: 'font[4]' } },
    name: { value: 'Calibri', source: { element: 'font[4]' } },
  },
  fill: {
    patternType: { value: 'solid', source: { element: 'fill[2]' } },
    fgColor: { value: '#00A933', source: { element: 'fill[2]' } },
  },
}

describe('RawStyleView — rendu complet', () => {
  it('affiche toutes les propriétés de font', () => {
    render(<RawStyleView resolvedStyle={fullStyle} />)
    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('color')).toBeInTheDocument()
    expect(screen.getByText('size')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('Calibri')).toBeInTheDocument()
    expect(screen.getByText('#BF0041')).toBeInTheDocument()
  })

  it('affiche toutes les propriétés de fill', () => {
    render(<RawStyleView resolvedStyle={fullStyle} />)
    expect(screen.getByText('fgColor')).toBeInTheDocument()
    expect(screen.getByText('#00A933')).toBeInTheDocument()
  })

  it('affiche les annotations de source — "font[4]" présent', () => {
    render(<RawStyleView resolvedStyle={fullStyle} />)
    const sources = screen.getAllByText('font[4]')
    expect(sources.length).toBeGreaterThan(0)
  })

  it('affiche les swatches pour les couleurs hex', () => {
    render(<RawStyleView resolvedStyle={fullStyle} />)
    const swatches = document.querySelectorAll('[title="#BF0041"], [title="#00A933"]')
    expect(swatches.length).toBe(2)
  })
})

describe('RawStyleView — sans données', () => {
  it('affiche "Aucune donnée de style" si resolvedStyle est undefined', () => {
    render(<RawStyleView resolvedStyle={undefined} />)
    expect(screen.getByText(/aucune donnée de style/i)).toBeInTheDocument()
  })
})

describe('CellInspector — toggle structuré / JSON', () => {
  const sheet = makeSheet()

  it('bascule en mode JSON au clic sur { }', async () => {
    const cell = makeCell('A1', {
      rawValue: 'hello',
      formattedValue: 'hello',
      type: 'string',
      resolvedStyle: fullStyle,
    })
    render(<CellInspector cell={cell} cellRef="A1" sheet={sheet} />)

    // Initially in structured mode — sections visible
    expect(screen.getByText('Police')).toBeInTheDocument()

    await userEvent.click(screen.getByTitle('Vue JSON'))

    // JSON mode — RawStyleView visible, named sections absent
    expect(screen.getByText('font')).toBeInTheDocument()
    expect(screen.queryByText('Police')).not.toBeInTheDocument()
  })

  it('conserve le mode JSON après changement de cellule', async () => {
    const cell1 = makeCell('A1', {
      rawValue: 'hello',
      formattedValue: 'hello',
      type: 'string',
      resolvedStyle: fullStyle,
    })
    const cell2 = makeCell('B2', {
      rawValue: 'world',
      formattedValue: 'world',
      type: 'string',
      resolvedStyle: fullStyle,
    })

    const { rerender } = render(<CellInspector cell={cell1} cellRef="A1" sheet={sheet} />)

    await userEvent.click(screen.getByTitle('Vue JSON'))
    expect(screen.getByText('font')).toBeInTheDocument()

    // Switch cell
    rerender(<CellInspector cell={cell2} cellRef="B2" sheet={sheet} />)

    // Still in JSON mode
    expect(screen.getByText('font')).toBeInTheDocument()
    expect(screen.queryByText('Police')).not.toBeInTheDocument()
  })
})
