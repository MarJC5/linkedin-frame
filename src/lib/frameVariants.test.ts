import { describe, it, expect } from 'vitest'
import { FRAME_VARIANTS, getVariant, type FrameVariantId } from './frameVariants'

describe('frameVariants', () => {
  it('exposes three variants', () => {
    const ids = FRAME_VARIANTS.map((v) => v.id).sort()
    expect(ids).toEqual(['arc-bottom', 'arc-top', 'circle'])
  })

  it('each variant has an id, a path d, and a startOffset', () => {
    for (const v of FRAME_VARIANTS) {
      expect(v.id).toMatch(/^(arc-bottom|arc-top|circle)$/)
      expect(v.pathD).toMatch(/^M /)
      expect(v.startOffset).toMatch(/^\d+(\.\d+)?%$/)
    }
  })

  it('every variant draws a full ring (two arc segments), not a truncated arc', () => {
    for (const v of FRAME_VARIANTS) {
      // Two relative-arc commands == a complete donut/ring path.
      expect(v.pathD.match(/a /g)?.length).toBe(2)
    }
  })

  it('banner variants carry a fade gradient; the circle is a solid ring', () => {
    expect(getVariant('arc-bottom').gradient).not.toBeNull()
    expect(getVariant('arc-top').gradient).not.toBeNull()
    expect(getVariant('circle').gradient).toBeNull()
  })

  it('the bottom banner fades upward and the top banner downward', () => {
    const bottom = getVariant('arc-bottom').gradient!
    const top = getVariant('arc-top').gradient!
    // Solid stop (y1) sits below the transparent stop (y2) for the bottom band.
    expect(bottom.y1).toBeGreaterThan(bottom.y2)
    // ...and above it for the top band.
    expect(top.y1).toBeLessThan(top.y2)
  })

  it('bottom and top banners trace the ring in opposite directions', () => {
    expect(getVariant('arc-top').pathD).not.toBe(getVariant('arc-bottom').pathD)
  })

  it('getVariant throws on unknown id', () => {
    expect(() => getVariant('nope' as FrameVariantId)).toThrow()
  })
})
