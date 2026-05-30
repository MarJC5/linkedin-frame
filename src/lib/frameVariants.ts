export type FrameVariantId = 'arc-bottom' | 'arc-top' | 'circle'

// Linear gradient endpoints in SVG user space (viewBox 0..100), used directly
// as the ring's stroke. Stop 0 (full color) sits at (x1,y1); stop 1 (same color,
// transparent) sits at (x2,y2). Because the stroke runs all the way around a
// FULL ring, the ring shows solid color only where it passes near (x1,y1) and
// dissolves into the photo as it approaches (x2,y2) — that fade is what creates
// the localised LinkedIn-style banner behind the text, NOT a truncated arc.
export type FrameGradient = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type FrameVariant = {
  id: FrameVariantId
  label: string
  // Always a full 360° ring. The visible "arc" is produced by the gradient.
  pathD: string
  // Where the text begins along the ring.
  startOffset: string
  // How the text is anchored at startOffset. 'start' lets it flow from the
  // side (the LinkedIn look) instead of being centred at the very bottom.
  textAnchor: 'start' | 'middle'
  // null → solid ring all the way around (no fade).
  gradient: FrameGradient | null
}

const R = 42
const CX = 50
const CY = 50
const L = CX - R // left point x (8)

// Full ring traced counter-clockwise through the BOTTOM: left → bottom → right
// → top → left. Travelling +x through the bottom keeps text upright there.
// The bottom point sits at 25% of the path length.
const RING_CCW =
  `M ${L},${CY} a ${R},${R} 0 1 0 ${2 * R},0 a ${R},${R} 0 1 0 ${-2 * R},0`

// Full ring traced clockwise through the TOP: left → top → right → bottom →
// left. Travelling +x through the top keeps text upright there. The top point
// sits at 25% of the path length.
const RING_CW =
  `M ${L},${CY} a ${R},${R} 0 1 1 ${2 * R},0 a ${R},${R} 0 1 1 ${-2 * R},0`

export const FRAME_VARIANTS: ReadonlyArray<FrameVariant> = [
  {
    // The classic #OPENTOWORK / #Hiring look: text starts on the lower-left
    // side (~9 o'clock) and flows along the bottom; solid colour across the
    // bottom cap, fading upward into the photo.
    id: 'arc-bottom',
    label: 'Bandeau bas',
    pathD: RING_CCW,
    startOffset: '3%',
    textAnchor: 'start',
    // Tilted up-and-right (not straight up) so the band stays solid higher on
    // the LEFT, where the text climbs from ~9 o'clock — the right side, which
    // carries less text, is allowed to fade sooner. Mirrors the reference.
    gradient: { x1: 58, y1: 84, x2: 72, y2: 52 },
  },
  {
    // Mirror: text starts on the upper-left side and flows along the top;
    // solid across the top cap, fading downward.
    id: 'arc-top',
    label: 'Bandeau haut',
    pathD: RING_CW,
    startOffset: '3%',
    textAnchor: 'start',
    // Mirror of arc-bottom: solid higher on the left where the text climbs
    // from ~9 o'clock along the top, fading toward the lower-right.
    gradient: { x1: 58, y1: 16, x2: 72, y2: 48 },
  },
  {
    // Solid ring all the way around — text wraps the full circle.
    id: 'circle',
    label: 'Anneau complet',
    pathD: RING_CCW,
    startOffset: '3%',
    textAnchor: 'start',
    gradient: null,
  },
]

export function getVariant(id: FrameVariantId): FrameVariant {
  const v = FRAME_VARIANTS.find((x) => x.id === id)
  if (!v) throw new Error(`Unknown frame variant: ${id}`)
  return v
}
