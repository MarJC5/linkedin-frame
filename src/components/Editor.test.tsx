import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor, type EditorState } from './Editor'

const defaultState: EditorState = {
  text: '#OPENTOWORK',
  color: '#3D7937',
  variant: 'arc-bottom',
  exportSize: 'native',
}

function Harness({
  onChange,
  onDownload = () => {},
  canDownload = true,
}: {
  onChange?: (s: EditorState) => void
  onDownload?: () => void
  canDownload?: boolean
}) {
  const [s, setS] = useState<EditorState>(defaultState)
  return (
    <Editor
      state={s}
      onChange={(next) => {
        setS(next)
        onChange?.(next)
      }}
      onDownload={onDownload}
      canDownload={canDownload}
    />
  )
}

describe('<Editor>', () => {
  it('changing the text input propagates onChange with new text', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onChange={onChange} />)
    const input = screen.getByLabelText(/texte/i)
    await user.clear(input)
    await user.type(input, 'HIRE ME')
    expect(onChange).toHaveBeenLastCalledWith({ ...defaultState, text: 'HIRE ME' })
  })

  it('changing the variant propagates onChange', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: /anneau/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaultState, variant: 'circle' })
  })

  it('changing the export size propagates onChange', () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/taille d.export/i), {
      target: { value: '800' },
    })
    expect(onChange).toHaveBeenCalledWith({ ...defaultState, exportSize: 800 })
  })

  it('download button is disabled when canDownload is false', () => {
    render(<Editor state={defaultState} onChange={() => {}} onDownload={() => {}} canDownload={false} />)
    expect(screen.getByRole('button', { name: /télécharger/i })).toBeDisabled()
  })

  it('download button calls onDownload when clicked', async () => {
    const onDownload = vi.fn()
    const user = userEvent.setup()
    render(<Editor state={defaultState} onChange={() => {}} onDownload={onDownload} canDownload />)
    await user.click(screen.getByRole('button', { name: /télécharger/i }))
    expect(onDownload).toHaveBeenCalled()
  })
})
