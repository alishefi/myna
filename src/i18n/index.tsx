import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react"
import { en } from "./en"
import { da } from "./da"
import type { Lang } from "../types"

const dictionaries = { en, da }

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof en
  dir: "ltr" | "rtl"
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  lang,
  setLang,
  children,
}: {
  lang: Lang
  setLang: (lang: Lang) => void
  children: ReactNode
}) {
  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: dictionaries[lang],
      dir: lang === "da" ? "rtl" : "ltr",
    }),
    [lang, setLang]
  )

  useEffect(() => {
    window.myna?.app.setLang(lang)
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
