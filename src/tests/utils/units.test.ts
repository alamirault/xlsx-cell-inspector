import { describe, it, expect } from 'vitest'
import { colWidthToPx, rowHeightToPx } from '../../utils/units'

describe('colWidthToPx', () => {
  it('returns 0 for width 0', () => {
    expect(colWidthToPx(0)).toBe(0)
  })

  it('returns 0 for negative width', () => {
    expect(colWidthToPx(-1)).toBe(0)
  })

  it('converts default Excel column width (8.43 chars)', () => {
    const px = colWidthToPx(8.43)
    expect(px).toBeGreaterThan(0)
    // 8.43 * 7 + 5 ≈ 64
    expect(px).toBeGreaterThan(50)
    expect(px).toBeLessThan(80)
  })

  it('larger width gives larger pixel value', () => {
    expect(colWidthToPx(20)).toBeGreaterThan(colWidthToPx(10))
  })
})

describe('rowHeightToPx', () => {
  it('returns 0 for height 0', () => {
    expect(rowHeightToPx(0)).toBe(0)
  })

  it('returns 0 for negative height', () => {
    expect(rowHeightToPx(-1)).toBe(0)
  })

  it('converts default row height (15pt)', () => {
    const px = rowHeightToPx(15)
    // 15 * (96/72) = 20
    expect(px).toBe(20)
  })

  it('is proportional — double points gives double pixels', () => {
    expect(rowHeightToPx(30)).toBe(rowHeightToPx(15) * 2)
  })
})
