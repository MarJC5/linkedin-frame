import { useId, useRef, useState } from 'react'
import { FrameSVG } from './FrameSVG'
import { loadImageFromFile } from '../lib/loadImage'
import type { FrameVariantId } from '../lib/frameVariants'
import styles from './FramePreview.module.css'

// Pan offset for the photo inside the square frame, in CSS object-position
// percent (0..100). 50/50 = centred (the default center-crop).
export type ImagePosition = { x: number; y: number }

const CENTERED: ImagePosition = { x: 50, y: 50 }

type Props = {
  image: HTMLImageElement | null
  text: string
  color: string
  variant: FrameVariantId
  position?: ImagePosition
  onPositionChange?: (p: ImagePosition) => void
  onImageLoaded?: (img: HTMLImageElement) => void
  rounded?: boolean
  className?: string
}

const clamp = (v: number) => Math.min(100, Math.max(0, v))

export function FramePreview({
  image,
  text,
  color,
  variant,
  position = CENTERED,
  onPositionChange,
  onImageLoaded,
  rounded,
  className,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const [isOver, setIsOver] = useState(false)

  // Live drag state for repositioning the photo: pointer origin, the position
  // when the drag started, and the image overflow (in screen px) per axis.
  const drag = useRef<{
    px: number
    py: number
    baseX: number
    baseY: number
    ovX: number
    ovY: number
  } | null>(null)

  const canReposition = Boolean(image && onPositionChange)

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0 || !onImageLoaded) return
    const file = list[0]
    if (!file.type.startsWith('image/')) return
    try {
      onImageLoaded(await loadImageFromFile(file))
    } catch {
      // swallow: surface UI error in a future iteration
    }
  }

  function openPicker() {
    inputRef.current?.click()
  }

  function overflow() {
    const el = frameRef.current
    if (!el || !image) return { x: 0, y: 0 }
    const size = el.clientWidth // the frame is square
    const scale = size / Math.min(image.naturalWidth, image.naturalHeight)
    return {
      x: image.naturalWidth * scale - size,
      y: image.naturalHeight * scale - size,
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!canReposition) return
    const ov = overflow()
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      baseX: position.x,
      baseY: position.y,
      ovX: ov.x,
      ovY: ov.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    const d = drag.current
    if (!d || !onPositionChange) return
    // Dragging the photo right should reveal its left edge → lower percent.
    const x =
      d.ovX > 0 ? clamp(d.baseX - ((e.clientX - d.px) / d.ovX) * 100) : d.baseX
    const y =
      d.ovY > 0 ? clamp(d.baseY - ((e.clientY - d.py) / d.ovY) * 100) : d.baseY
    onPositionChange({ x, y })
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!drag.current) return
    drag.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <div
        ref={frameRef}
        className={`${styles.frame} ${rounded ? styles.rounded : ''} ${
          isOver ? styles.over : ''
        }`}
        onDragOver={(e) => {
          if (!onImageLoaded) return
          e.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          if (!onImageLoaded) return
          e.preventDefault()
          setIsOver(false)
          void handleFiles(e.dataTransfer.files)
        }}
      >
        {image ? (
          <img
            className={`${styles.img} ${canReposition ? styles.draggable : ''}`}
            src={image.src}
            alt=""
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            draggable={false}
          />
        ) : (
          <button
            type="button"
            className={styles.placeholder}
            onClick={openPicker}
          >
            <svg
              className={styles.uploadIcon}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 16V4m0 0L7 9m5-5 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <strong>Glissez votre photo</strong>
            <span>ou cliquez pour parcourir</span>
          </button>
        )}

        <FrameSVG
          className={styles.svg}
          text={text}
          color={color}
          variant={variant}
        />
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Photo"
        className={styles.input}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {image && (
        <p className={styles.caption}>
          Glissez la photo pour la recadrer ·{' '}
          <button type="button" className={styles.change} onClick={openPicker}>
            Changer la photo
          </button>
        </p>
      )}
    </div>
  )
}
