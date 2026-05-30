import { useEffect, useState } from 'react'
import { Editor, type EditorState } from './components/Editor'
import { FramePreview, type ImagePosition } from './components/FramePreview'
import { composeAndDownload } from './lib/composeAndDownload'
import styles from './App.module.css'

const CENTERED: ImagePosition = { x: 50, y: 50 }

const DEFAULT_STATE: EditorState = {
  text: '#FREELANCE',
  color: '#0A66C2',
  variant: 'arc-bottom',
  exportSize: 'native',
}

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [state, setState] = useState<EditorState>(DEFAULT_STATE)
  const [position, setPosition] = useState<ImagePosition>(CENTERED)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  useEffect(() => {
    if (!privacyOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPrivacyOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [privacyOpen])

  function handleImageLoaded(img: HTMLImageElement) {
    setImage(img)
    setPosition(CENTERED) // re-centre when a new photo is loaded
  }

  async function handleDownload() {
    if (!image) return
    await composeAndDownload({
      image,
      text: state.text,
      color: state.color,
      variant: state.variant,
      position,
      exportSize: state.exportSize,
      filename: `linkedin-frame-${Date.now()}.png`,
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <p className={styles.eyebrow}>Générateur de frame LinkedIn</p>
        <h1 className={styles.title}>Encadrez votre photo de profil.</h1>
        <p className={styles.subtitle}>
          Un bandeau circulaire sur-mesure. Texte et couleur libres, recadrage
          au glisser. Tout se passe dans votre navigateur, rien n'est envoyé
          nulle part.
        </p>
      </header>

      <main className={styles.split}>
        <section className={styles.previewSide}>
          <div className={styles.previewInner}>
            <FramePreview
              image={image}
              text={state.text}
              color={state.color}
              variant={state.variant}
              position={position}
              onPositionChange={setPosition}
              onImageLoaded={handleImageLoaded}
              rounded
            />
          </div>
        </section>

        <section className={styles.controlsSide}>
          <Editor
            state={state}
            onChange={setState}
            onDownload={handleDownload}
            canDownload={image !== null}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} LinkedIn Frame Generator</span>
        <div className={styles.footerLinks}>
          <a
            className={styles.privacyLink}
            href="https://www.buymeacoffee.com/misits"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Buy me a coffee
          </a>
          <button
            type="button"
            className={styles.privacyLink}
            onClick={() => setPrivacyOpen(true)}
          >
            Confidentialité
          </button>
        </div>
      </footer>

      {privacyOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
          onClick={() => setPrivacyOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 id="privacy-title" className={styles.modalTitle}>
              Confidentialité
            </h2>
            <p className={styles.modalText}>
              Aucune image n'est envoyée nulle part. Tout est traité localement
              dans votre navigateur, et rien n'est conservé après rechargement.
            </p>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setPrivacyOpen(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
