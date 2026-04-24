import type {
  ResolvedStyle,
  ResolvedFont,
  ResolvedFill,
  ResolvedBorder,
  ResolvedBorderSide,
  ResolvedAlignment,
  ResolvedProtection,
  ResolvedProperty,
} from '../types'

// ── Internal parsed representations from styles.xml ──────────────────────────

interface FontDef {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  size?: number
  name?: string
  family?: number
  color?: string
  charset?: number
  vertAlign?: string
}

interface FillDef {
  patternType?: string
  fgColor?: string
  bgColor?: string
}

interface BorderSideDef {
  style?: string
  color?: string
}

interface BorderDef {
  left?: BorderSideDef
  right?: BorderSideDef
  top?: BorderSideDef
  bottom?: BorderSideDef
  diagonal?: BorderSideDef
  diagonalUp?: boolean
  diagonalDown?: boolean
}

interface AlignmentDef {
  horizontal?: string
  vertical?: string
  wrapText?: boolean
  indent?: number
  shrinkToFit?: boolean
  textRotation?: number
}

interface ProtectionDef {
  locked?: boolean
  hidden?: boolean
}

interface NumFmtDef {
  numFmtId: number
  formatCode: string
}

interface XfDef {
  fontId: number
  fillId: number
  borderId: number
  numFmtId: number
  alignment?: AlignmentDef
  protection?: ProtectionDef
}

export interface StylesIndex {
  fonts: FontDef[]
  fills: FillDef[]
  borders: BorderDef[]
  numFmts: NumFmtDef[]
  cellXfs: XfDef[]
}

// ── Color conversion ──────────────────────────────────────────────────────────

function parseOoxmlColor(el: Element | null): string | undefined {
  if (!el) return undefined
  const rgb = el.getAttribute('rgb')
  if (rgb) {
    if (rgb.length === 8) return `#${rgb.slice(2)}`
    if (rgb.length === 6) return `#${rgb}`
    return `#${rgb}`
  }
  const theme = el.getAttribute('theme')
  const tint = el.getAttribute('tint')
  if (theme !== null) return tint ? `theme:${theme} tint:${tint}` : `theme:${theme}`
  const indexed = el.getAttribute('indexed')
  if (indexed !== null) return `indexed:${indexed}`
  return undefined
}

// ── Element helpers ───────────────────────────────────────────────────────────

function getChildren(doc: Document, tagName: string): Element[] {
  const parent = doc.getElementsByTagName(tagName)[0]
  return parent ? Array.from(parent.children) : []
}

function childBool(el: Element, tagName: string): boolean | undefined {
  const child = el.getElementsByTagName(tagName)[0]
  if (!child) return undefined
  const val = child.getAttribute('val')
  return val === null || val === 'true' || val === '1'
}

function childVal(el: Element, tagName: string): string | undefined {
  return el.getElementsByTagName(tagName)[0]?.getAttribute('val') ?? undefined
}

function childNum(el: Element, tagName: string): number | undefined {
  const v = childVal(el, tagName)
  return v !== undefined ? parseFloat(v) : undefined
}

function attrBool(el: Element, attr: string): boolean | undefined {
  const v = el.getAttribute(attr)
  if (v === null) return undefined
  return v === 'true' || v === '1'
}

function attrNum(el: Element, attr: string): number | undefined {
  const v = el.getAttribute(attr)
  return v !== null ? parseFloat(v) : undefined
}

// ── Element parsers ───────────────────────────────────────────────────────────

function parseFont(el: Element): FontDef {
  return {
    bold: childBool(el, 'b'),
    italic: childBool(el, 'i'),
    underline: childBool(el, 'u'),
    strike: childBool(el, 'strike'),
    size: childNum(el, 'sz'),
    name: childVal(el, 'name'),
    family: childNum(el, 'family'),
    color: parseOoxmlColor(el.getElementsByTagName('color')[0] ?? null),
    charset: childNum(el, 'charset'),
    vertAlign: childVal(el, 'vertAlign'),
  }
}

function parseFill(el: Element): FillDef {
  const pf = el.getElementsByTagName('patternFill')[0]
  if (!pf) return {}
  return {
    patternType: pf.getAttribute('patternType') ?? undefined,
    fgColor: parseOoxmlColor(pf.getElementsByTagName('fgColor')[0] ?? null),
    bgColor: parseOoxmlColor(pf.getElementsByTagName('bgColor')[0] ?? null),
  }
}

function parseBorderSide(el: Element | undefined): BorderSideDef | undefined {
  if (!el) return undefined
  const style = el.getAttribute('style')
  const color = parseOoxmlColor(el.getElementsByTagName('color')[0] ?? null)
  if (!style && !color) return undefined
  return { style: style ?? undefined, color }
}

function parseBorder(el: Element): BorderDef {
  const get = (tag: string) => parseBorderSide(el.getElementsByTagName(tag)[0])
  return {
    left: get('left'),
    right: get('right'),
    top: get('top'),
    bottom: get('bottom'),
    diagonal: get('diagonal'),
    diagonalUp: attrBool(el, 'diagonalUp'),
    diagonalDown: attrBool(el, 'diagonalDown'),
  }
}

function parseAlignment(el: Element): AlignmentDef {
  const wt = el.getAttribute('wrapText')
  const stf = el.getAttribute('shrinkToFit')
  return {
    horizontal: el.getAttribute('horizontal') ?? undefined,
    vertical: el.getAttribute('vertical') ?? undefined,
    wrapText: wt !== null ? wt === 'true' || wt === '1' : undefined,
    indent: attrNum(el, 'indent'),
    shrinkToFit: stf !== null ? stf === 'true' || stf === '1' : undefined,
    textRotation: attrNum(el, 'textRotation'),
  }
}

function parseProtection(el: Element): ProtectionDef {
  const locked = el.getAttribute('locked')
  const hidden = el.getAttribute('hidden')
  return {
    locked: locked !== null ? locked === 'true' || locked === '1' : undefined,
    hidden: hidden !== null ? hidden === 'true' || hidden === '1' : undefined,
  }
}

function parseNumFmt(el: Element): NumFmtDef {
  return {
    numFmtId: parseInt(el.getAttribute('numFmtId') ?? '0', 10),
    formatCode: el.getAttribute('formatCode') ?? 'General',
  }
}

function parseXf(el: Element): XfDef {
  const alignEl = el.getElementsByTagName('alignment')[0]
  const protEl = el.getElementsByTagName('protection')[0]
  return {
    fontId: parseInt(el.getAttribute('fontId') ?? '0', 10),
    fillId: parseInt(el.getAttribute('fillId') ?? '0', 10),
    borderId: parseInt(el.getAttribute('borderId') ?? '0', 10),
    numFmtId: parseInt(el.getAttribute('numFmtId') ?? '0', 10),
    alignment: alignEl ? parseAlignment(alignEl) : undefined,
    protection: protEl ? parseProtection(protEl) : undefined,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function emptyStylesIndex(): StylesIndex {
  return { fonts: [], fills: [], borders: [], numFmts: [], cellXfs: [] }
}

export function parseStylesXml(xml: string): StylesIndex {
  let doc: Document
  try {
    doc = new DOMParser().parseFromString(xml, 'application/xml')
    if (doc.getElementsByTagName('parsererror').length > 0) return emptyStylesIndex()
  } catch {
    return emptyStylesIndex()
  }

  return {
    fonts: getChildren(doc, 'fonts').map(parseFont),
    fills: getChildren(doc, 'fills').map(parseFill),
    borders: getChildren(doc, 'borders').map(parseBorder),
    numFmts: getChildren(doc, 'numFmts').map(parseNumFmt),
    cellXfs: getChildren(doc, 'cellXfs').map(parseXf),
  }
}

// ── Style resolution ──────────────────────────────────────────────────────────

function prop<T>(value: T, element: string): ResolvedProperty<T> {
  return { value, source: { element } }
}

export function resolveStyle(index: number, si: StylesIndex): ResolvedStyle | undefined {
  const xf = si.cellXfs[index]
  if (!xf) return undefined

  const result: ResolvedStyle = {}

  // Font
  const font = si.fonts[xf.fontId]
  if (font) {
    const src = `font[${xf.fontId}]`
    const rf: ResolvedFont = {}
    if (font.bold !== undefined) rf.bold = prop(font.bold, src)
    if (font.italic !== undefined) rf.italic = prop(font.italic, src)
    if (font.underline !== undefined) rf.underline = prop(font.underline, src)
    if (font.strike !== undefined) rf.strike = prop(font.strike, src)
    if (font.size !== undefined) rf.size = prop(font.size, src)
    if (font.name !== undefined) rf.name = prop(font.name, src)
    if (font.family !== undefined) rf.family = prop(font.family, src)
    if (font.color !== undefined) rf.color = prop(font.color, src)
    if (font.charset !== undefined) rf.charset = prop(font.charset, src)
    if (font.vertAlign !== undefined) rf.vertAlign = prop(font.vertAlign, src)
    if (Object.keys(rf).length > 0) result.font = rf
  }

  // Fill
  const fill = si.fills[xf.fillId]
  if (fill && fill.patternType !== 'none' && fill.patternType !== undefined) {
    const src = `fill[${xf.fillId}]`
    const rf: ResolvedFill = {}
    rf.patternType = prop(fill.patternType, src)
    if (fill.fgColor !== undefined) rf.fgColor = prop(fill.fgColor, src)
    if (fill.bgColor !== undefined) rf.bgColor = prop(fill.bgColor, src)
    result.fill = rf
  }

  // Border
  const border = si.borders[xf.borderId]
  if (border) {
    const src = `border[${xf.borderId}]`
    const rb: ResolvedBorder = {}
    const resolveSide = (side: BorderSideDef | undefined): ResolvedBorderSide | undefined => {
      if (!side) return undefined
      const rs: ResolvedBorderSide = {}
      if (side.style !== undefined) rs.style = prop(side.style, src)
      if (side.color !== undefined) rs.color = prop(side.color, src)
      return Object.keys(rs).length > 0 ? rs : undefined
    }
    rb.top = resolveSide(border.top)
    rb.right = resolveSide(border.right)
    rb.bottom = resolveSide(border.bottom)
    rb.left = resolveSide(border.left)
    rb.diagonal = resolveSide(border.diagonal)
    if (border.diagonalUp !== undefined) rb.diagonalUp = prop(border.diagonalUp, src)
    if (border.diagonalDown !== undefined) rb.diagonalDown = prop(border.diagonalDown, src)
    if (rb.top || rb.right || rb.bottom || rb.left || rb.diagonal ||
        rb.diagonalUp || rb.diagonalDown) {
      result.border = rb
    }
  }

  // Alignment (from xf itself)
  if (xf.alignment) {
    const src = `xf[${index}]`
    const ra: ResolvedAlignment = {}
    const a = xf.alignment
    if (a.horizontal !== undefined) ra.horizontal = prop(a.horizontal, src)
    if (a.vertical !== undefined) ra.vertical = prop(a.vertical, src)
    if (a.wrapText !== undefined) ra.wrapText = prop(a.wrapText, src)
    if (a.indent !== undefined) ra.indent = prop(a.indent, src)
    if (a.shrinkToFit !== undefined) ra.shrinkToFit = prop(a.shrinkToFit, src)
    if (a.textRotation !== undefined) ra.textRotation = prop(a.textRotation, src)
    if (Object.keys(ra).length > 0) result.alignment = ra
  }

  // Protection (from xf itself)
  if (xf.protection) {
    const src = `xf[${index}]`
    const rp: ResolvedProtection = {}
    if (xf.protection.locked !== undefined) rp.locked = prop(xf.protection.locked, src)
    if (xf.protection.hidden !== undefined) rp.hidden = prop(xf.protection.hidden, src)
    if (Object.keys(rp).length > 0) result.protection = rp
  }

  // numFmt
  const builtinFormats: Record<number, string> = {
    0: 'General', 1: '0', 2: '0.00', 3: '#,##0', 4: '#,##0.00',
    9: '0%', 10: '0.00%', 11: '0.00E+00', 12: '# ?/?', 13: '# ??/??',
    14: 'mm-dd-yy', 15: 'd-mmm-yy', 16: 'd-mmm', 17: 'mmm-yy',
    18: 'h:mm AM/PM', 19: 'h:mm:ss AM/PM', 20: 'h:mm', 21: 'h:mm:ss',
    22: 'm/d/yy h:mm', 37: '#,##0 ;(#,##0)', 38: '#,##0 ;[Red](#,##0)',
    39: '#,##0.00;(#,##0.00)', 40: '#,##0.00;[Red](#,##0.00)',
    45: 'mm:ss', 46: '[h]:mm:ss', 47: 'mmss.0', 48: '##0.0E+0', 49: '@',
  }
  if (xf.numFmtId !== 0) {
    const custom = si.numFmts.find(n => n.numFmtId === xf.numFmtId)
    const code = custom?.formatCode ?? builtinFormats[xf.numFmtId]
    if (code) {
      result.numFmt = prop(code, `numFmt[${xf.numFmtId}]`)
      result.numFmtId = prop(xf.numFmtId, `xf[${index}]`)
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}
