interface XlsxColor {
  rgb?: string
  theme?: number
  tint?: number
  indexed?: number
}

export function xlsxColorToHex(color: XlsxColor | undefined): string | undefined {
  if (!color) return undefined
  if (color.rgb) {
    // SheetJS uses ARGB (8 chars), we want RRGGBB
    const hex = color.rgb.replace(/^FF/i, '#').replace(/^([0-9A-F]{6})$/i, '#$1')
    if (hex.startsWith('#') && hex.length === 7) return hex
    if (color.rgb.length === 8) return `#${color.rgb.slice(2)}`
    if (color.rgb.length === 6) return `#${color.rgb}`
    return `#${color.rgb}`
  }
  return undefined
}
