import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FrameSVG } from '../components/FrameSVG'
import type { ImagePosition } from '../components/FramePreview'
import type { FrameVariantId } from './frameVariants'

type ExportSize = 'native' | number

type Params = {
  image: HTMLImageElement
  text: string
  color: string
  variant: FrameVariantId
  position?: ImagePosition
  exportSize: ExportSize
  filename: string
}

function frameSvgString(text: string, color: string, variant: FrameVariantId): string {
  const markup = renderToStaticMarkup(createElement(FrameSVG, { text, color, variant }))
  return markup.includes('xmlns')
    ? markup
    : markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('SVG image failed to load'))
    img.src = src
  })
}

export async function composeAndDownload({
  image,
  text,
  color,
  variant,
  position = { x: 50, y: 50 },
  exportSize,
  filename,
}: Params): Promise<void> {
  const nativeSquare = Math.min(image.naturalWidth, image.naturalHeight)
  const size = exportSize === 'native' ? nativeSquare : exportSize

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  // Crop the source square at the user-chosen position (50/50 = centred),
  // matching the live preview's object-position panning.
  const sx = ((image.naturalWidth - nativeSquare) * position.x) / 100
  const sy = ((image.naturalHeight - nativeSquare) * position.y) / 100
  ctx.drawImage(image, sx, sy, nativeSquare, nativeSquare, 0, 0, size, size)

  const svgString = frameSvgString(text, color, variant)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const svgImg = await loadImage(svgUrl)
    ctx.drawImage(svgImg, 0, 0, size, size)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      'image/png',
    )
  })

  const downloadUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    a.rel = 'noopener'
    a.click()
  } finally {
    URL.revokeObjectURL(downloadUrl)
  }
}
