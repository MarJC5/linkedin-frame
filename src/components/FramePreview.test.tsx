import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FramePreview } from './FramePreview'

function makeImg(src = 'blob:test'): HTMLImageElement {
  const img = new Image()
  img.src = src
  Object.defineProperty(img, 'naturalWidth', { value: 800 })
  Object.defineProperty(img, 'naturalHeight', { value: 800 })
  return img
}

describe('<FramePreview>', () => {
  it('renders a placeholder when no image is provided', () => {
    render(
      <FramePreview
        image={null}
        text="#OPENTOWORK"
        color="#3D7937"
        variant="arc-bottom"
      />,
    )
    expect(screen.getByText(/photo/i)).toBeInTheDocument()
  })

  it('renders the image and the FrameSVG when an image is provided', () => {
    const { container } = render(
      <FramePreview
        image={makeImg('blob:abc')}
        text="HI"
        color="#000"
        variant="arc-bottom"
      />,
    )
    const img = container.querySelector('img')
    const svg = container.querySelector('svg')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('blob:abc')
    expect(svg).not.toBeNull()
    expect(svg?.querySelector('textPath')?.textContent).toBe('HI')
  })
})
