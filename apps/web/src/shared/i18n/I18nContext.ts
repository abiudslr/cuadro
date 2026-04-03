import { createContext } from 'react'
import { translations, type Language } from './translations'

export type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function getTranslationValue(language: Language, key: string) {
  return key
    .split('.')
    .reduce<unknown>((value, segment) => {
      if (value && typeof value === 'object' && segment in value) {
        return (value as Record<string, unknown>)[segment]
      }

      return undefined
    }, translations[language])
}
