import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker, COLOR_PRESETS } from './ColorPicker'
import { translations } from '../lib/i18n'

// Without an I18nProvider the default context resolves French labels.
const labelOf = (key: string) => translations.fr[`color.${key}`]

describe('<ColorPicker>', () => {
  it('renders all color presets as buttons', () => {
    render(<ColorPicker value="#000000" onChange={() => {}} />)
    for (const p of COLOR_PRESETS) {
      expect(
        screen.getByRole('button', { name: labelOf(p.key) }),
      ).toBeInTheDocument()
    }
  })

  it('calls onChange with the preset color when a preset is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorPicker value="#000000" onChange={onChange} />)
    const first = COLOR_PRESETS[0]
    await user.click(screen.getByRole('button', { name: labelOf(first.key) }))
    expect(onChange).toHaveBeenCalledWith(first.value)
  })

  it('calls onChange when the color input changes', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#000000" onChange={onChange} />)
    const input = screen.getByLabelText(/personnalis/i) as HTMLInputElement
    fireEvent.input(input, { target: { value: '#abcdef' } })
    expect(onChange).toHaveBeenCalledWith('#abcdef')
  })

  it('marks the active preset', () => {
    render(<ColorPicker value={COLOR_PRESETS[1].value} onChange={() => {}} />)
    const active = screen.getByRole('button', {
      name: labelOf(COLOR_PRESETS[1].key),
    })
    expect(active).toHaveAttribute('aria-pressed', 'true')
  })
})
