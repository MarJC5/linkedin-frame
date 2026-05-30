import { useId } from 'react'
import { getVariant, type FrameVariantId } from '../lib/frameVariants'

type Props = {
  text: string
  color: string
  variant: FrameVariantId
  className?: string
}

// Thick band so the coloured stroke reads as a banner, matching the LinkedIn
// frame. The stroke is centred on R (42), so a width of 16 puts the OUTER edge
// at 42 + 8 = 50 — flush with the viewBox / photo edge ("bord à bord"), exactly
// like the reference (R 133.75 + 52.5/2 = 160 = edge in its 320 box).
const STROKE_WIDTH = 16

export function FrameSVG({ text, color, variant, className }: Props) {
  const variantDef = getVariant(variant)
  const uid = useId().replace(/:/g, '')
  const pathId = `frame-path-${uid}`
  const gradId = `frame-grad-${uid}`
  const grad = variantDef.gradient

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <path id={pathId} d={variantDef.pathD} fill="none" />
        {grad && (
          <linearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1={grad.x1}
            y1={grad.y1}
            x2={grad.x2}
            y2={grad.y2}
          >
            {/* Full colour where the text sits, fading to transparent so the
                rest of the ring dissolves into the photo. */}
            <stop offset="0" stopColor={color} stopOpacity={1} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        )}
      </defs>

      <use
        href={`#${pathId}`}
        stroke={grad ? `url(#${gradId})` : color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="butt"
        fill="none"
      />

      <text
        fill="#ffffff"
        textAnchor={variantDef.textAnchor}
        dy="0.32em"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="10"
        letterSpacing="0.2"
      >
        <textPath href={`#${pathId}`} startOffset={variantDef.startOffset}>
          {text}
        </textPath>
      </text>
    </svg>
  )
}
