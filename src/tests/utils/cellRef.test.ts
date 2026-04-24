import { describe, it, expect } from 'vitest'
import { colIndexToLetter, cellRefFromIndexes, parseCellRef } from '../../utils/cellRef'

describe('colIndexToLetter', () => {
  it('converts 0 to A', () => expect(colIndexToLetter(0)).toBe('A'))
  it('converts 25 to Z', () => expect(colIndexToLetter(25)).toBe('Z'))
  it('converts 26 to AA', () => expect(colIndexToLetter(26)).toBe('AA'))
  it('converts 51 to AZ', () => expect(colIndexToLetter(51)).toBe('AZ'))
})

describe('cellRefFromIndexes', () => {
  it('builds B4 from row=3, col=1', () => {
    expect(cellRefFromIndexes(3, 1)).toBe('B4')
  })

  it('builds A1 from row=0, col=0', () => {
    expect(cellRefFromIndexes(0, 0)).toBe('A1')
  })
})

describe('parseCellRef', () => {
  it('parses B4 correctly', () => {
    expect(parseCellRef('B4')).toEqual({ col: 1, row: 3 })
  })

  it('returns null for invalid ref', () => {
    expect(parseCellRef('invalid')).toBeNull()
  })
})
