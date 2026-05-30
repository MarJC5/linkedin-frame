import styles from './ColorPicker.module.css'

export type ColorPreset = { label: string; value: string }

export const COLOR_PRESETS: ReadonlyArray<ColorPreset> = [
  { label: 'Vert OpenToWork', value: '#3D7937' },
  { label: 'Bleu LinkedIn', value: '#0A66C2' },
  { label: 'Orange', value: '#E0651A' },
  { label: 'Rouge', value: '#C0392B' },
  { label: 'Violet', value: '#6E40C9' },
  { label: 'Noir', value: '#111111' },
]

type Props = {
  value: string
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.presets} role="group" aria-label="Couleurs prédéfinies">
        {COLOR_PRESETS.map((p) => {
          const active = p.value.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={p.value}
              type="button"
              className={styles.preset}
              style={{ background: p.value }}
              aria-label={p.label}
              aria-pressed={active}
              onClick={() => onChange(p.value)}
            />
          )
        })}
      </div>
      <label className={styles.custom}>
        <span>Couleur personnalisée</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
