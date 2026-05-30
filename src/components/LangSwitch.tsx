import { LANGS, useI18n } from '../lib/i18n'
import styles from './LangSwitch.module.css'

type Props = { className?: string }

export function LangSwitch({ className }: Props) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      className={`${styles.switch} ${className ?? ''}`}
      role="group"
      aria-label={t('nav.lang')}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={styles.btn}
          aria-pressed={l === lang}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
