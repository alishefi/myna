import { useEffect } from "react"
import { I18nProvider } from "./i18n"
import { useAppStore } from "./store/appStore"
import { Layout } from "./components/shared/Layout"
import { notePlainText } from "./lib/exportNote"
import { generateMemoryInsights } from "./lib/memoryAi"

function App() {
  const hydrated = useAppStore((s) => s.hydrated)
  const hydrate = useAppStore((s) => s.hydrate)
  const lang = useAppStore((s) => s.settings.lang)
  const theme = useAppStore((s) => s.settings.theme)
  const updateSettings = useAppStore((s) => s.updateSettings)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Memory Layer: silently learns from what you write, in the background — no dedicated UI of its own.
  // Other parts of the app (e.g. Prompts) read useAppStore.getState().memoryInsights to use it.
  useEffect(() => {
    if (!hydrated) return
    const { memoryInsights, notes, moodEntries, setMemoryInsights } = useAppStore.getState()
    const today = new Date().toISOString().slice(0, 10)
    if (memoryInsights?.date === today) return

    const excerpts = [...notes]
      .filter((n) => notePlainText(n).trim().length > 20)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8)
      .map((n) => notePlainText(n).trim().slice(0, 220))
    const moods = [...moodEntries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10).map((m) => m.mood)

    generateMemoryInsights(excerpts, moods).then((res) => {
      if ("error" in res) return
      setMemoryInsights({ date: today, ...res.insights })
    })
  }, [hydrated])

  useEffect(() => {
    document.documentElement.dir = lang === "da" ? "rtl" : "ltr"
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    const apply = (dark: boolean) => document.documentElement.classList.toggle("dark", dark)
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mq.matches)
      const onChange = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    }
    apply(theme === "dark")
  }, [theme])

  if (!hydrated) {
    return <div className="h-full w-full bg-paper" />
  }

  return (
    <I18nProvider lang={lang} setLang={(l) => updateSettings({ lang: l })}>
      <Layout />
    </I18nProvider>
  )
}

export default App
