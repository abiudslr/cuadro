type RgbColor = {
  r: number
  g: number
  b: number
}

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function expandHex(hex: string) {
  if (hex.length === 3) {
    return hex
      .split('')
      .map((part) => `${part}${part}`)
      .join('')
  }

  return hex
}

export function parseHexColor(color: string): RgbColor | null {
  const normalized = color.trim().replace('#', '')
  const hex = expandHex(normalized)

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function toLinearChannel(value: number) {
  const normalized = value / 255

  if (normalized <= 0.04045) {
    return normalized / 12.92
  }

  return ((normalized + 0.055) / 1.055) ** 2.4
}

export function getRelativeLuminance(color: string) {
  const rgb = parseHexColor(color)

  if (!rgb) {
    return 0
  }

  return (
    0.2126 * toLinearChannel(rgb.r) +
    0.7152 * toLinearChannel(rgb.g) +
    0.0722 * toLinearChannel(rgb.b)
  )
}

export function rgba(color: string, alpha: number) {
  const rgb = parseHexColor(color)

  if (!rgb) {
    return `rgba(255, 255, 255, ${alpha})`
  }

  return `rgba(${clampChannel(rgb.r)}, ${clampChannel(rgb.g)}, ${clampChannel(rgb.b)}, ${alpha})`
}

export function getContrastTone(color: string) {
  return getRelativeLuminance(color) > 0.54 ? '#0f1117' : '#f4f5f7'
}
