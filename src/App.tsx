import { useEffect, useState } from 'react'
import { Editor, type EditorState } from './components/Editor'
import { FramePreview, type ImagePosition } from './components/FramePreview'
import { LangSwitch } from './components/LangSwitch'
import { composeAndDownload } from './lib/composeAndDownload'
import { useI18n } from './lib/i18n'
import styles from './App.module.css'

const CENTERED: ImagePosition = { x: 50, y: 50 }

const DEFAULT_STATE: EditorState = {
  text: '#FREELANCE',
  color: '#0A66C2',
  variant: 'arc-bottom',
  exportSize: 'native',
}

export default function App() {
  const { t } = useI18n()
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
        <LangSwitch className={styles.langSwitch} />
        <p className={styles.eyebrow}>{t('masthead.eyebrow')}</p>
        <h1 className={styles.title}>{t('masthead.title')}</h1>
        <p className={styles.subtitle}>{t('masthead.subtitle')}</p>
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
            {t('footer.privacy')}
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
              {t('modal.title')}
            </h2>
            <p className={styles.modalText}>{t('modal.text')}</p>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setPrivacyOpen(false)}
            >
              {t('modal.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
