import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { I18nProvider } from './components/I18nProvider'

function renderApp() {
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  )
}

describe('i18n', () => {
  it('defaults to French and exposes a language switch', () => {
    renderApp()
    expect(
      screen.getByRole('button', { name: 'Télécharger en PNG' }),
    ).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('fr')
  })

  it('switches the whole UI to English and updates <html lang>', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(
      screen.getByRole('button', { name: 'Download as PNG' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Télécharger en PNG' }),
    ).toBeNull()
    expect(screen.getByText('Frame your profile photo.')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })
})
