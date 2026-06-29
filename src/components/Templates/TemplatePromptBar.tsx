import { useState } from "react"
import { ArrowUp, Sparkles, Wand2 } from "lucide-react"
import clsx from "clsx"
import { generateTemplateDoc } from "../../lib/templateAi"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"

export function TemplatePromptBar() {
  const { t } = useI18n()
  const suggestions = [t.templates.promptSuggestion1, t.templates.promptSuggestion2, t.templates.promptSuggestion3, t.templates.promptSuggestion4]
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createCustomTemplate = useAppStore((s) => s.createCustomTemplate)
  const openTemplateBlueprint = useUiStore((s) => s.openTemplateBlueprint)

  const generate = async (prompt: string) => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    const res = await generateTemplateDoc("custom", prompt)
    setLoading(false)
    if ("error" in res) {
      setError(res.error)
      return
    }
    const tpl = createCustomTemplate({ name: res.name, content: JSON.stringify(res.content) })
    setValue("")
    openTemplateBlueprint(tpl.id)
  }

  return (
    <div className="max-w-[640px] mx-auto mb-14">
      <div
        className={clsx(
          "rounded-full p-[2px] bg-gradient-to-r from-amber via-rose to-blue transition-opacity duration-300",
          loading ? "opacity-100 animate-pulse" : "opacity-40 hover:opacity-70 focus-within:opacity-100"
        )}
      >
        <div className="relative bg-paper-raised rounded-full shadow-sm">
          <Sparkles size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber pointer-events-none" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") generate(value)
            }}
            placeholder={t.templates.promptPlaceholder}
            disabled={loading}
            className="no-drag w-full bg-transparent rounded-full pl-12 pr-14 py-4 text-[15px] outline-none disabled:opacity-70"
          />
          <button
            type="button"
            onClick={() => generate(value)}
            disabled={loading || !value.trim()}
            className="no-drag absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-amber to-rose text-white grid place-items-center disabled:from-black/15 disabled:to-black/15 disabled:text-ink-soft/50 hover:scale-110 active:scale-95 transition-transform"
          >
            {loading ? <Wand2 size={16} className="animate-pulse" /> : <ArrowUp size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => generate(s)}
            disabled={loading}
            className="no-drag text-[12.5px] px-3.5 py-1.5 rounded-full bg-black/4 text-ink-soft hover:bg-amber/10 hover:text-amber transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="text-[12.5px] text-rose text-center mt-3">{error}</div>}
    </div>
  )
}
