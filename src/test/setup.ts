import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// jsdom reports navigator.language as 'en-US'; pin the UI to French in tests so
// assertions on French copy stay valid. Tests that need English set it themselves.
beforeEach(() => {
  localStorage.setItem('lang', 'fr')
})
