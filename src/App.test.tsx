import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./lib/composeAndDownload', () => ({
  composeAndDownload: vi.fn().mockResolvedValue(undefined),
}))

import App from './App'
import { composeAndDownload } from './lib/composeAndDownload'

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:abc'),
    revokeObjectURL: vi.fn(),
  })
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
})

describe('<App>', () => {
  it('shows the placeholder and a disabled download button on mount', () => {
    render(<App />)
    expect(screen.getByText(/glissez votre photo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /télécharger/i })).toBeDisabled()
  })

  it('after loading an image, the preview shows it and the download button is enabled', async () => {
    render(<App />)
    const fileInput = screen.getByLabelText(/photo/i) as HTMLInputElement
    const file = new File(['x'], 'me.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /télécharger/i })).toBeEnabled()
    })
  })

  it('clicking download invokes composeAndDownload with the current state', async () => {
    const user = userEvent.setup()
    render(<App />)
    const fileInput = screen.getByLabelText(/photo/i) as HTMLInputElement
    const file = new File(['x'], 'me.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger/i })).toBeEnabled(),
    )

    await user.click(screen.getByRole('button', { name: /télécharger/i }))

    expect(composeAndDownload).toHaveBeenCalledTimes(1)
    const call = (composeAndDownload as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call).toMatchObject({
      text: '#FREELANCE',
      color: '#0A66C2',
      variant: 'arc-bottom',
      exportSize: 'native',
    })
    expect(call.image).toBeInstanceOf(HTMLImageElement)
    expect(call.filename).toMatch(/\.png$/)
  })

  it('reveals the RGPD reassurance text in a modal via the privacy link', async () => {
    const user = userEvent.setup()
    render(<App />)
    // Not shown until the user opens the privacy modal.
    expect(screen.queryByText(/aucune image n.est envoy/i)).toBeNull()

    await user.click(screen.getByRole('button', { name: /confidentialité/i }))

    expect(screen.getByText(/aucune image n.est envoy/i)).toBeInTheDocument()
  })
})
