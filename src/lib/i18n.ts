import { createContext, useContext } from 'react'

export type Lang = 'fr' | 'en'

export const LANGS: ReadonlyArray<Lang> = ['fr', 'en']

export const STORAGE_KEY = 'lang'

type Dict = Record<string, string>

export const translations: Record<Lang, Dict> = {
  fr: {
    'meta.title': 'LinkedIn Frame Generator',
    'nav.lang': 'Langue',
    'masthead.eyebrow': 'Générateur de frame LinkedIn',
    'masthead.title': 'Encadrez votre photo de profil.',
    'masthead.subtitle':
      "Un bandeau circulaire sur-mesure. Texte et couleur libres, recadrage au glisser. Tout se passe dans votre navigateur, rien n'est envoyé nulle part.",
    'footer.privacy': 'Confidentialité',
    'modal.title': 'Confidentialité',
    'modal.text':
      "Aucune image n'est envoyée nulle part. Tout est traité localement dans votre navigateur, et rien n'est conservé après rechargement.",
    'modal.close': 'Fermer',
    'field.text': 'Texte de la frame',
    'field.color': 'Couleur',
    'field.style': 'Style de frame',
    'field.export': "Taille d'export",
    'export.native': 'Taille native (recommandé)',
    'action.download': 'Télécharger en PNG',
    'variant.arc-bottom': 'Bandeau bas',
    'variant.arc-top': 'Bandeau haut',
    'variant.circle': 'Anneau complet',
    'color.group': 'Couleurs prédéfinies',
    'color.custom': 'Couleur personnalisée',
    'color.green-otw': 'Vert OpenToWork',
    'color.linkedin': 'Bleu LinkedIn',
    'color.orange': 'Orange',
    'color.red': 'Rouge',
    'color.purple': 'Violet',
    'color.black': 'Noir',
    'upload.title': 'Glissez votre photo',
    'upload.sub': 'ou cliquez pour parcourir',
    'preview.photo': 'Photo',
    'preview.reposition': 'Glissez la photo pour la recadrer',
    'preview.change': 'Changer la photo',
  },
  en: {
    'meta.title': 'LinkedIn Frame Generator',
    'nav.lang': 'Language',
    'masthead.eyebrow': 'LinkedIn frame generator',
    'masthead.title': 'Frame your profile photo.',
    'masthead.subtitle':
      'A custom circular banner. Free text and color, drag to reposition. Everything runs in your browser, nothing is ever uploaded.',
    'footer.privacy': 'Privacy',
    'modal.title': 'Privacy',
    'modal.text':
      'No image is ever uploaded. Everything is processed locally in your browser, and nothing is kept after a reload.',
    'modal.close': 'Close',
    'field.text': 'Frame text',
    'field.color': 'Color',
    'field.style': 'Frame style',
    'field.export': 'Export size',
    'export.native': 'Native size (recommended)',
    'action.download': 'Download as PNG',
    'variant.arc-bottom': 'Bottom banner',
    'variant.arc-top': 'Top banner',
    'variant.circle': 'Full ring',
    'color.group': 'Preset colors',
    'color.custom': 'Custom color',
    'color.green-otw': 'OpenToWork green',
    'color.linkedin': 'LinkedIn blue',
    'color.orange': 'Orange',
    'color.red': 'Red',
    'color.purple': 'Purple',
    'color.black': 'Black',
    'upload.title': 'Drop your photo',
    'upload.sub': 'or click to browse',
    'preview.photo': 'Photo',
    'preview.reposition': 'Drag the photo to reposition',
    'preview.change': 'Change photo',
  },
}

/** Resolve the initial language: stored choice → browser → French fallback. */
export function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    // localStorage unavailable (private mode, SSR): fall through.
  }
  const nav =
    typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : ''
  return nav.startsWith('en') ? 'en' : 'fr'
}

export type I18n = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18n>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => translations.fr[key] ?? key,
})

export function useI18n(): I18n {
  return useContext(I18nContext)
}

/** Build the translate function for a given language. */
export function translator(lang: Lang): (key: string) => string {
  return (key) => translations[lang][key] ?? key
}
