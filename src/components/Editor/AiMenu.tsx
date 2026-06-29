import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import gsap from "gsap"
import clsx from "clsx"
import {
  Sparkles,
  FileText,
  Wand2,
  ListTree,
  SpellCheck2,
  PenLine,
  Lightbulb,
  Languages,
  Tags,
  Maximize2,
  ListChecks,
  ChevronDown,
  Check,
  Copy,
  BookOpen,
  NotebookPen,
  FileEdit,
  Newspaper,
} from "lucide-react"
import { useI18n } from "../../i18n"
import { runAi, type AiAction } from "../../lib/ai"

const actionIcons: Partial<Record<AiAction, typeof Sparkles>> = {
  rewrite: Wand2,
  summarize: FileText,
  expand: Maximize2,
  grammar: SpellCheck2,
  structure: ListTree,
  keyPoints: ListChecks,
  continue: PenLine,
  ideas: Lightbulb,
  translateToDari: Languages,
  translateToEnglish: Languages,
  tags: Tags,
  prompt: Lightbulb,
  bookOutline: BookOpen,
  bookChapter: NotebookPen,
  contentSection: FileEdit,
  blogPost: Newspaper,
}

export function AiMenu({ editor }: { editor: Editor | null }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<AiAction | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const groups: { label: string; actions: AiAction[] }[] = [
    { label: t.ai.groupWriting, actions: ["rewrite", "summarize", "expand", "grammar", "structure", "keyPoints", "continue", "ideas"] },
    { label: t.ai.groupBook, actions: ["bookOutline", "bookChapter", "contentSection", "blogPost"] },
    { label: t.ai.groupTranslate, actions: ["translateToDari", "translateToEnglish"] },
    { label: t.ai.groupOrganize, actions: ["tags", "prompt"] },
  ]

  const labelFor: Partial<Record<AiAction, string>> = {
    rewrite: t.ai.rewrite,
    summarize: t.ai.summarize,
    expand: t.ai.expand,
    grammar: t.ai.grammar,
    structure: t.ai.structure,
    keyPoints: t.ai.keyPoints,
    continue: t.ai.continue,
    ideas: t.ai.ideas,
    translateToDari: t.ai.translate,
    translateToEnglish: t.ai.translateEn,
    tags: t.ai.tags,
    prompt: t.ai.prompts,
    bookOutline: t.ai.bookOutline,
    bookChapter: t.ai.bookChapter,
    contentSection: t.ai.contentSection,
    blogPost: t.ai.blogPost,
  }

  const close = () => {
    setOpen(false)
    setResult(null)
    setError(false)
    setCopied(false)
    setLoading(null)
  }

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  // Animate the dropdown opening: panel pops in, then each option slides in one after another.
  useEffect(() => {
    if (!open || !panelRef.current) return
    const panel = panelRef.current
    const opts = panel.querySelectorAll(".ai-opt")
    gsap.fromTo(panel, { opacity: 0, y: -10, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "power3.out" })
    gsap.fromTo(opts, { opacity: 0, y: 8, x: -6 }, { opacity: 1, y: 0, x: 0, duration: 0.32, ease: "back.out(1.7)", stagger: 0.035, delay: 0.06 })
  }, [open])

  const run = async (action: AiAction) => {
    if (!editor) return
    setLoading(action)
    setError(false)
    setResult(null)
    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to, "\n").trim()
    const text = selected || editor.getText()
    const res = await runAi(action, text || " ")
    setLoading(null)
    if (res.error || !res.text) {
      setError(true)
      return
    }
    setResult(res.text)
  }

  const insertResult = () => {
    if (!editor || !result) return
    const { from, to } = editor.state.selection
    const html = `<p>${escapeHtml(result)}</p>`
    if (from !== to) {
      editor.chain().focus().insertContentAt({ from, to }, html).run()
    } else {
      editor.chain().focus("end").insertContent(html).run()
    }
    close()
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="no-drag inline-flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-amber transition-colors shrink-0"
      >
        <Sparkles size={14} />
        {t.editor.ai}
        <ChevronDown size={13} className={clsx("transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-1.5 w-72 bg-paper-raised border border-ink/15 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {!result && !loading && !error && (
            <div className="p-1.5 max-h-96 overflow-y-auto scrollbar-thin">
              {groups.map((g, gi) => (
                <div key={g.label}>
                  {gi > 0 && <div className="h-px bg-line my-1.5 mx-1.5" />}
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft/60 px-2.5 pt-1.5 pb-1">{g.label}</div>
                  <div className="flex flex-col gap-0.5">
                    {g.actions.map((a) => {
                      const Icon = actionIcons[a]!
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => run(a)}
                          className="ai-opt no-drag flex items-center gap-2 text-left text-[12.5px] font-medium text-ink px-2.5 py-2 rounded-lg hover:bg-black/5 transition-colors"
                        >
                          <Icon size={13} className="text-ink-soft shrink-0" />
                          {labelFor[a]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && <div className="p-4 text-[13px] text-ink-soft animate-pulse">{t.ai.thinking}</div>}

          {error && (
            <div className="p-4">
              <div className="text-[13px] text-rose mb-2">{t.ai.error}</div>
              <button type="button" onClick={() => setError(false)} className="no-drag text-[12px] text-ink-soft underline">
                {t.common.back}
              </button>
            </div>
          )}

          {result && (
            <div className="p-3 w-80">
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink max-h-56 overflow-y-auto scrollbar-thin mb-3">
                {result}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={insertResult} className="no-drag text-[12px] px-2.5 py-1.5 rounded-full bg-ink text-paper font-medium">
                  {t.ai.apply}
                </button>
                <button
                  type="button"
                  onClick={copyResult}
                  className="no-drag text-[12px] px-2.5 py-1.5 rounded-full bg-black/5 text-ink font-medium flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? t.ai.copied : t.ai.copy}
                </button>
                <button type="button" onClick={() => setResult(null)} className="no-drag text-[12px] px-2 py-1.5 rounded-full text-ink-soft hover:text-ink">
                  {t.common.back}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")
}
