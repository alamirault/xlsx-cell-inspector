import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseWorkbook } from '../../utils/parseWorkbook'

const fixturePath = resolve(__dirname, '../fixtures/financial-sample.xlsx')

function loadFixture(): ArrayBuffer {
  const buf = readFileSync(fixturePath)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

describe('parseWorkbook — fixture: financial-sample.xlsx', () => {
  it('returns the correct sheet name', () => {
    const wb = parseWorkbook(loadFixture())
    expect(wb.sheets).toHaveLength(1)
    expect(wb.sheets[0].name).toBe('Sheet1')
  })

  it('parses the expected number of rows and columns', () => {
    const wb = parseWorkbook(loadFixture())
    const sheet = wb.sheets[0]
    expect(sheet.rowCount).toBe(701)
    expect(sheet.colCount).toBe(16)
  })

  it('reads the header row correctly (A1 = "Segment")', () => {
    const wb = parseWorkbook(loadFixture())
    const cell = wb.sheets[0].cells['A1']
    expect(cell.rawValue).toBe('Segment')
    expect(cell.type).toBe('string')
  })

  it('reads a numeric cell (E2 = 1618.5)', () => {
    const wb = parseWorkbook(loadFixture())
    const cell = wb.sheets[0].cells['E2']
    expect(cell.rawValue).toBe(1618.5)
    expect(cell.type).toBe('number')
  })

  it('reads the formatted value for a currency cell (F2 = $3.00)', () => {
    const wb = parseWorkbook(loadFixture())
    const cell = wb.sheets[0].cells['F2']
    expect(cell.formattedValue).toMatch(/\$/)
    expect(cell.rawValue).toBe(3)
  })

  it('extracts column widths from the sheet', () => {
    const wb = parseWorkbook(loadFixture())
    const columns = wb.sheets[0].columns
    expect(columns.length).toBeGreaterThan(0)
    expect(columns[0].widthPx).toBeGreaterThan(0)
    expect(columns[0].letter).toBe('A')
  })

  it('returns activeSheetIndex = 0', () => {
    const wb = parseWorkbook(loadFixture())
    expect(wb.activeSheetIndex).toBe(0)
  })
})
