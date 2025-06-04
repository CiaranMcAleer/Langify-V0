// contexts/language-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getUiTranslations } from "@/actions/app"

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (lang: string) => void
  t: (key: string, params?: { [key: string]: string | number }) => string
  availableLanguages: { code: string; name: string }[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState("en") // Default to English
  const [translations, setTranslations] = useState<{ [key: string]: { [key: string]: string } }>({})
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true)

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "it", name: "Italiano" },
  ]

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoadingTranslations(true)
      const fetchedTranslations = await getUiTranslations()
      setTranslations(fetchedTranslations)
      // Try to load saved language from localStorage
      const savedLang = localStorage.getItem("langify-ui-language")
      if (savedLang && fetchedTranslations[savedLang]) {
        setCurrentLanguage(savedLang)
      } else {
        setCurrentLanguage("en") // Fallback to English if no saved language or invalid
      }
      setIsLoadingTranslations(false)
    }
    loadTranslations()
  }, [])

  const setLanguage = useCallback(
    (lang: string) => {
      if (translations[lang]) {
        setCurrentLanguage(lang)
        localStorage.setItem("langify-ui-language", lang)
      }
    },
    [translations],
  )

  const t = useCallback(
    (key: string, params?: { [key: string]: string | number }) => {
      let translatedString = translations[currentLanguage]?.[key] || key // Fallback to key if not found

      if (params) {
        for (const paramKey in params) {
          translatedString = translatedString.replace(`{${paramKey}}`, String(params[paramKey]))
        }
      }
      return translatedString
    },
    [currentLanguage, translations],
  )

  if (isLoadingTranslations) {
    return null // Or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
