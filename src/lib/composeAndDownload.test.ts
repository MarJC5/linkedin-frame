import { describe, it, expect, vi, beforeEach } from 'vitest'
import { composeAndDownload } from './composeAndDownload'

type DrawCall = { args: unknown[] }

function makeImage(w: number, h: number): HTMLImageElement {
  const img = new Image()
  Object.defineProperty(img, 'naturalWidth', { value: w, configurable: true })
  Object.defineProperty(img, 'naturalHeight', { value: h, configurable: true })
  return img
}

const createdUrls: string[] = []
const revokedUrls: string[] = []
let drawCalls: DrawCall[] = []
let lastBlobType: string | undefined
let canvasW = 0
let canvasH = 0
let clickedAnchor: HTMLAnchorElement | null = null

beforeEach(() => {
  createdUrls.length = 0
  revokedUrls.length = 0
  drawCalls = []
  lastBlobType = undefined
  canvasW = 0
  canvasH = 0
  clickedAnchor = null

  let n = 0
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => {
      const u = `blob:test-${n++}`
      createdUrls.push(u)
      return u
    }),
    revokeObjectURL: vi.fn((u: string) => revokedUrls.push(u)),
  })

  // Auto-fire image load
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true,
    set(this: HTMLImageElement, v: string) {
      this.setAttribute('src', v)
      queueMicrotask(() => this.dispatchEvent(new Event('load')))
    },
    get(this: HTMLImageElement) {
      return this.getAttribute('src') ?? ''
    },
  })

  // Mock canvas
  const fakeBlob = new Blob(['png-bytes'], { type: 'image/png' })
  Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
    configurable: true,
    set(v: number) {
      canvasW = v
    },
    get() {
      return canvasW
    },
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
    configurable: true,
    set(v: number) {
      canvasH = v
    },
    get() {
      return canvasH
    },
  })
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: (...args: unknown[]) => drawCalls.push({ args }),
    clearRect: vi.fn(),
  })) as unknown as HTMLCanvasElement['getContext']
  HTMLCanvasElement.prototype.toBlob = vi.fn(
    function (this: HTMLCanvasElement, cb: BlobCallback, type?: string) {
      lastBlobType = type
      cb(fakeBlob)
    },
  ) as unknown as HTMLCanvasElement['toBlob']

  // Intercept anchor click
  const origClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    clickedAnchor = this
  }
  // restore in afterEach via vitest's auto cleanup is fine for this single suite,
  // but keep a reference to avoid TS unused warnings
  void origClick
})

describe('composeAndDownload', () => {
  it('draws the image at native size and exports a PNG', async () => {
    const img = makeImage(1200, 1200)
    await composeAndDownload({
      image: img,
      text: '#OPENTOWORK',
      color: '#3D7937',
      variant: 'arc-bottom',
      exportSize: 'native',
      filename: 'frame.png',
    })

    expect(canvasW).toBe(1200)
    expect(canvasH).toBe(1200)
    expect(drawCalls.length).toBeGreaterThanOrEqual(2)
    expect(drawCalls[0].args[0]).toBe(img)
    expect(lastBlobType).toBe('image/png')
  })

  it('crops to a centered square when the image is not square', async () => {
    const img = makeImage(1600, 1000)
    await composeAndDownload({
      image: img,
      text: 'X',
      color: '#000',
      variant: 'arc-bottom',
      exportSize: 'native',
      filename: 'a.png',
    })
    expect(canvasW).toBe(1000)
    expect(canvasH).toBe(1000)
  })

  it('uses the requested fixed export size when provided', async () => {
    const img = makeImage(1200, 1200)
    await composeAndDownload({
      image: img,
      text: 'X',
      color: '#000',
      variant: 'arc-bottom',
      exportSize: 800,
      filename: 'a.png',
    })
    expect(canvasW).toBe(800)
    expect(canvasH).toBe(800)
  })

  it('triggers an anchor download with the given filename', async () => {
    const img = makeImage(400, 400)
    await composeAndDownload({
      image: img,
      text: 'X',
      color: '#000',
      variant: 'arc-bottom',
      exportSize: 'native',
      filename: 'my-frame.png',
    })
    expect(clickedAnchor).not.toBeNull()
    expect(clickedAnchor?.download).toBe('my-frame.png')
    expect(clickedAnchor?.href).toMatch(/^blob:/)
  })

  it('revokes all object URLs it created', async () => {
    const img = makeImage(400, 400)
    await composeAndDownload({
      image: img,
      text: 'X',
      color: '#000',
      variant: 'arc-bottom',
      exportSize: 'native',
      filename: 'a.png',
    })
    expect(revokedUrls.sort()).toEqual(createdUrls.sort())
  })
})
