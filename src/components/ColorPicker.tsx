import { useI18n } from '../lib/i18n'
import styles from './ColorPicker.module.css'

// `key` maps to a translation key (`color.<key>`); the visible label is resolved
// at render time so preset names follow the active language.
export type ColorPreset = { key: string; value: string }

export const COLOR_PRESETS: ReadonlyArray<ColorPreset> = [
  { key: 'green-otw', value: '#3D7937' },
  { key: 'linkedin', value: '#0A66C2' },
  { key: 'orange', value: '#E0651A' },
  { key: 'red', value: '#C0392B' },
  { key: 'purple', value: '#6E40C9' },
  { key: 'black', value: '#111111' },
]

type Props = {
  value: string
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  const { t } = useI18n()

  return (
    <div className={styles.wrap}>
      <div className={styles.presets} role="group" aria-label={t('color.group')}>
        {COLOR_PRESETS.map((p) => {
          const active = p.value.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={p.value}
              type="button"
              className={styles.preset}
              style={{ background: p.value }}
              aria-label={t(`color.${p.key}`)}
              aria-pressed={active}
              onClick={() => onChange(p.value)}
            />
          )
        })}
      </div>
      <label className={styles.custom}>
        <span>{t('color.custom')}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
