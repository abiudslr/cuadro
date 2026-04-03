import {
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react'
import { I18nContext, getTranslationValue, type I18nContextValue } from './I18nContext'
import { useLanguageStore } from './languageStore'

export function I18nProvider({ children }: PropsWithChildren) {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => {
        const result = getTranslationValue(language, key)
        return typeof result === 'string' ? result : key
      },
    }),
    [language, setLanguage]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
