import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FrameSVG } from './FrameSVG'
import { getVariant } from '../lib/frameVariants'

describe('<FrameSVG>', () => {
  it('renders the provided text along the arc', () => {
    const { container } = render(
      <FrameSVG text="#OPENTOWORK" color="#3D7937" variant="arc-bottom" />,
    )
    const textPath = container.querySelector('textPath')
    expect(textPath).not.toBeNull()
    expect(textPath?.textContent).toBe('#OPENTOWORK')
  })

  it('paints arc variants with the given color via a fade gradient', () => {
    const { container } = render(
      <FrameSVG text="HI" color="#FF6600" variant="arc-bottom" />,
    )
    const stops = container.querySelectorAll('stop')
    expect(stops.length).toBeGreaterThanOrEqual(2)
    for (const s of stops) {
      expect(s.getAttribute('stop-color')).toBe('#FF6600')
    }
    expect(container.querySelector('use')?.getAttribute('stroke')).toMatch(
      /^url\(#frame-grad-/,
    )
  })

  it('paints the circle variant with the color directly (no gradient)', () => {
    const { container } = render(
      <FrameSVG text="X" color="#0000FF" variant="circle" />,
    )
    expect(container.querySelectorAll('stop').length).toBe(0)
    expect(container.querySelector('use')?.getAttribute('stroke')).toBe('#0000FF')
  })

  it('uses the path d matching the chosen variant', () => {
    const { container } = render(
      <FrameSVG text="X" color="#000" variant="arc-top" />,
    )
    const path = container.querySelector('path')
    expect(path?.getAttribute('d')).toBe(getVariant('arc-top').pathD)
  })

  it('uses viewBox 0 0 100 100 so it scales to its container', () => {
    const { container } = render(
      <FrameSVG text="X" color="#000" variant="arc-bottom" />,
    )
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(
      '0 0 100 100',
    )
  })
})
