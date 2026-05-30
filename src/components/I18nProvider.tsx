import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  detectLang,
  I18nContext,
  STORAGE_KEY,
  translations,
  translator,
  type Lang,
} from '../lib/i18n'

type Props = { children: React.ReactNode }

export function I18nProvider({ children }: Props) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore unavailable localStorage
    }
  }, [])

  // Keep <html lang> and the document title in sync with the active language.
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = translations[lang]['meta.title']
  }, [lang])

  const value = useMemo(
    () => ({ lang, setLang, t: translator(lang) }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
