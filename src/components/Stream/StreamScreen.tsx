import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import { Timer, FileDown, Sparkles, Trash2, Save } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { ScreenHeader } from "../shared/ScreenHeader"
import { runAi } from "../../lib/ai"
import { useGsapEntrance } from "../../lib/useGsapEntrance"

const presets = [1, 3, 5, 10, 15, 20]

export function StreamScreen() {
  const { t } = useI18n()
  const [phase, setPhase] = useState<"setup" | "writing" | "done">("setup")
  const [minutes, setMinutes] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const addStreamSession = useAppStore((s) => s.addStreamSession)
  const createNote = useAppStore((s) => s.createNote)
  const openEditor = useUiStore((s) => s.openEditor)
  const ref = useGsapEntrance()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase !== "writing") return
    if (secondsLeft <= 0) {
      setPhase("done")
      return
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, secondsLeft])

  const start = () => {
    setSecondsLeft(minutes * 60)
    setContent("")
    setPhase("writing")
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const finishEarly = () => setPhase("done")

  const reset = () => {
    setPhase("setup")
    setContent("")
    setSummary(null)
  }

  const handleSave = () => {
    addStreamSession(minutes, content)
    reset()
  }

  const handleConvert = () => {
    addStreamSession(minutes, content)
    const note = createNote({
      content: JSON.stringify({
        type: "doc",
        content: content.split("\n").filter(Boolean).map((line) => ({ type: "paragraph", content: [{ type: "text", text: line }] })),
      }),
      tags: ["stream-writing"],
    })
    openEditor(note.id)
  }

  const handleSummarize = async () => {
    setSummary(t.ai.thinking)
    const res = await runAi("summarize", content)
    setSummary(res.text ?? t.ai.error)
  }

  const handleDiscard = () => reset()

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0")
  const ss = String(secondsLeft % 60).padStart(2, "0")

  if (phase === "writing") {
    return (
      <div className="h-full flex flex-col items-center px-16 py-12 w-full">
        <div className="text-[48px] font-serif tabular-nums text-ink mb-8 tracking-tight">{mm}:{ss}</div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.stream.subtitle}
          className="w-full flex-1 bg-transparent outline-none resize-none text-[19px] leading-relaxed font-serif text-ink placeholder:text-ink-soft/40"
        />
        <button type="button" onClick={finishEarly} className="no-drag mt-5 text-[14px] text-ink-soft hover:text-ink underline">
          {t.stream.timeUp}
        </button>
      </div>
    )
  }

  if (phase === "done") {
    return (
      <div className="p-12 w-full">
        <ScreenHeader title={t.stream.timeUp} />
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div className="rounded-2xl border border-line bg-paper-raised p-7 max-h-[520px] overflow-y-auto scrollbar-thin whitespace-pre-wrap text-[16px] leading-relaxed text-ink font-serif">
            {content || "…"}
          </div>
          <div>
            {summary && (
              <div className="rounded-2xl border border-amber/30 bg-amber-soft/30 p-5 mb-5 text-[14.5px] leading-relaxed text-ink">
                {summary}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={handleSave} className="no-drag flex items-center justify-center gap-2 bg-ink text-paper px-5 py-3 rounded-full text-[14px] font-medium hover:bg-amber">
                <Save size={15} />
                {t.stream.keep}
              </button>
              <button type="button" onClick={handleConvert} className="no-drag flex items-center justify-center gap-2 bg-black/5 text-ink px-5 py-3 rounded-full text-[14px] font-medium hover:bg-black/10">
                <FileDown size={15} />
                {t.stream.structure}
              </button>
              <button type="button" onClick={handleSummarize} className="no-drag flex items-center justify-center gap-2 bg-black/5 text-ink px-5 py-3 rounded-full text-[14px] font-medium hover:bg-black/10">
                <Sparkles size={15} />
                {t.stream.summarize}
              </button>
              <button type="button" onClick={handleDiscard} className="no-drag flex items-center justify-center gap-2 text-ink-soft px-5 py-3 rounded-full text-[14px] font-medium hover:text-rose">
                <Trash2 size={15} />
                {t.stream.discard}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="p-12 w-full h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-soft text-amber grid place-items-center mb-6">
        <Timer size={26} />
      </div>
      <h1 className="font-serif text-[34px] text-ink mb-2.5">{t.stream.title}</h1>
      <p className="text-[15px] text-ink-soft mb-10">{t.stream.subtitle}</p>

      <div className="text-[13px] font-medium text-ink-soft mb-4">{t.stream.setTimer}</div>
      <div className="flex justify-center gap-3 flex-wrap mb-10">
        {presets.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            className={clsx(
              "no-drag w-16 h-16 rounded-full border text-[15.5px] font-medium transition-all",
              minutes === m ? "bg-ink text-paper border-ink" : "border-line text-ink-soft hover:border-ink/30"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <button type="button" onClick={start} className="no-drag bg-ink text-paper px-10 py-3.5 rounded-full text-[15px] font-medium hover:bg-amber transition-colors">
        {t.stream.start}
      </button>
    </div>
  )
}
