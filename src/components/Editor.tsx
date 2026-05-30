import { FRAME_VARIANTS, type FrameVariantId } from '../lib/frameVariants'
import { ColorPicker } from './ColorPicker'
import styles from './Editor.module.css'

export type ExportSize = 'native' | 400 | 800

export type EditorState = {
  text: string
  color: string
  variant: FrameVariantId
  exportSize: ExportSize
}

type Props = {
  state: EditorState
  onChange: (next: EditorState) => void
  onDownload: () => void
  canDownload: boolean
}

export function Editor({ state, onChange, onDownload, canDownload }: Props) {
  function set<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    onChange({ ...state, [key]: value })
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className={styles.label}>Texte de la frame</span>
        <input
          type="text"
          aria-label="Texte de la frame"
          value={state.text}
          maxLength={24}
          onChange={(e) => set('text', e.target.value)}
        />
        <span className={styles.hint}>{state.text.length} / 24</span>
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Couleur</span>
        <ColorPicker value={state.color} onChange={(c) => set('color', c)} />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Style de frame</span>
        <div className={styles.radios} role="radiogroup" aria-label="Style de frame">
          {FRAME_VARIANTS.map((v) => (
            <label key={v.id} className={styles.radio}>
              <input
                type="radio"
                name="variant"
                value={v.id}
                checked={state.variant === v.id}
                onChange={() => set('variant', v.id)}
              />
              <span>{v.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Taille d'export</span>
        <select
          aria-label="Taille d'export"
          value={String(state.exportSize)}
          onChange={(e) => {
            const v = e.target.value
            set('exportSize', v === 'native' ? 'native' : (Number(v) as ExportSize))
          }}
        >
          <option value="native">Taille native (recommandé)</option>
          <option value="800">800 × 800 px</option>
          <option value="400">400 × 400 px</option>
        </select>
      </label>

      <button
        type="button"
        className={styles.download}
        disabled={!canDownload}
        onClick={onDownload}
      >
        Télécharger en PNG
      </button>
    </div>
  )
}
