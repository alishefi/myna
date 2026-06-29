import { useMemo, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { ArrowLeft, ChevronDown, History, Save, Sparkles, Wand2, X } from "lucide-react"
import clsx from "clsx"
import { buildExtensions } from "../Editor/extensions"
import { BookPagination } from "../Editor/BookPaginationExtension"
import { TemplateDocToolbar } from "../Templates/TemplateDocToolbar"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { exportNoteAsPdf, exportNoteAsDocx } from "../../lib/exportNote"
import { tiptapWordCount } from "../../lib/bookEngine"
import { continueSceneThreeWays, improveChapterClarity, suggestChapterEdits, summarizeChapter } from "../../lib/bookAi"
import { sectionLabels } from "../../lib/bookBlueprint"

type AssistKind = "summarize" | "edits" | "clarity"

export function ChapterEditor() {
  const { t, lang } = useI18n()
  const labels = sectionLabels(lang)
  const bookChapterId = useUiStore((s) => s.bookChapterId)
  const closeBookChapter = useUiStore((s) => s.closeBookChapter)
  const chapter = useAppStore((s) => s.bookChapters.find((c) => c.id === bookChapterId))
  const allChapters = useAppStore((s) => s.bookChapters)
  const allProjects = useAppStore((s) => s.bookProjects)
  const updateBookChapter = useAppStore((s) => s.updateBookChapter)
  const deleteBookChapter = useAppStore((s) => s.deleteBookChapter)
  const saveChapterDraft = useAppStore((s) => s.saveChapterDraft)
  const restoreChapterDraft = useAppStore((s) => s.restoreChapterDraft)
  const deleteChapterDraft = useAppStore((s) => s.deleteChapterDraft)

  const project = useMemo(() => allProjects.find((p) => p.id === chapter?.projectId), [allProjects, chapter?.projectId])
  const siblingChapters = useMemo(
    () => (chapter ? allChapters.filter((c) => c.projectId === chapter.projectId).sort((a, b) => a.order - b.order) : []),
    [allChapters, chapter]
  )

  const [continuations, setContinuations] = useState<string[] | null>(null)
  const [continueError, setContinueError] = useState<string | null>(null)
  const [continueLoading, setContinueLoading] = useState(false)
  const [draftsOpen, setDraftsOpen] = useState(false)
  const [assistOpen, setAssistOpen] = useState(false)
  const [assistLoading, setAssistLoading] = useState<AssistKind | null>(null)
  const [assistResult, setAssistResult] = useState<{ kind: AssistKind; text: string } | null>(null)
  const [assistError, setAssistError] = useState<string | null>(null)

  const content = chapter?.content ?? ""
  const isBlueprintPaginated = !!project?.isBlueprint && chapter?.sectionType !== "toc"
  const editor = useEditor(
    {
      extensions: [...buildExtensions("", lang), ...(isBlueprintPaginated ? [BookPagination.configure({ pageContentHeight: 934 })] : [])],
      content: content ? safeParse(content) : "",
      onUpdate: ({ editor }) => {
        if (chapter) updateBookChapter(chapter.id, { content: JSON.stringify(editor.getJSON()) })
      },
    },
    [chapter?.id, isBlueprintPaginated, lang]
  )

  if (!chapter) return null

  const wordCount = tiptapWordCount(chapter.content)

  const handleExport = async (kind: "pdf" | "docx" | "myna") => {
    if (kind === "pdf") await exportNoteAsPdf({ title: chapter.title, content: chapter.content })
    else if (kind === "docx") await exportNoteAsDocx({ title: chapter.title, content: chapter.content })
    else {
      const buf = new TextEncoder().encode(JSON.stringify({ title: chapter.title, content: chapter.content }, null, 2))
      await window.myna.exportFile.saveBuffer({ defaultName: `${chapter.title || t.books.chapter}.myna`, filters: [{ name: "Myna Note", extensions: ["myna"] }], buffer: buf })
    }
  }

  const handleDelete = () => {
    deleteBookChapter(chapter.id)
    closeBookChapter()
  }

  const handleContinue = async () => {
    if (!editor) return
    setContinueLoading(true)
    setContinueError(null)
    setContinuations(null)
    const res = await continueSceneThreeWays(editor.getText(), lang)
    setContinueLoading(false)
    if ("error" in res) {
      setContinueError(res.error)
      return
    }
    setContinuations(res.options)
  }

  const insertContinuation = (text: string) => {
    if (!editor) return
    editor.chain().focus("end").insertContent(`<p>${escapeHtml(text)}</p>`).run()
    setContinuations(null)
  }

  const runAssist = async (kind: AssistKind) => {
    if (!editor) return
    setAssistLoading(kind)
    setAssistError(null)
    setAssistResult(null)
    const fn = kind === "summarize" ? summarizeChapter : kind === "edits" ? suggestChapterEdits : improveChapterClarity
    const res = await fn(editor.getText(), lang)
    setAssistLoading(null)
    if ("error" in res) {
      setAssistError(res.error)
      return
    }
    setAssistResult({ kind, text: res.text })
  }

  const applyClarityRewrite = () => {
    if (!editor || !assistResult || assistResult.kind !== "clarity") return
    editor.chain().focus().selectAll().deleteSelection().insertContent(`<p>${escapeHtml(assistResult.text)}</p>`).run()
    setAssistResult(null)
    setAssistOpen(false)
  }

  const isToc = chapter.sectionType === "toc"
  const isBlueprintChapter = !!project?.isBlueprint
  const isDropCapEligible = isBlueprintChapter && (chapter.kind ?? "chapter") === "chapter"

  return (
    <div className="h-full flex flex-col bg-black/4 print:bg-paper">
      <div className="flex items-center gap-3 px-4 h-9 shrink-0 print:hidden bg-paper border-b border-line/60">
        <button type="button" onClick={closeBookChapter} className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink shrink-0">
          <ArrowLeft size={14} />
          {t.books.backToBook}
        </button>
        <input
          value={chapter.title}
          onChange={(e) => updateBookChapter(chapter.id, { title: e.target.value })}
          placeholder={t.books.chapterTitlePlaceholder}
          className="no-drag flex-1 max-w-[320px] bg-transparent outline-none text-[13px] font-medium text-ink placeholder:text-ink-soft/50"
        />
        <span className="text-[12px] text-ink-soft shrink-0">{wordCount} {t.books.words}</span>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDraftsOpen((v) => !v)}
            className="no-drag flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink"
          >
            <History size={13} />
            {t.books.drafts}
            <ChevronDown size={12} className={clsx("transition-transform", draftsOpen && "rotate-180")} />
          </button>
          {draftsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-paper-raised border border-line rounded-xl shadow-lg z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  saveChapterDraft(chapter.id, t.books.draftDefaultLabel.replace("{n}", String(chapter.drafts.length + 1)))
                  setDraftsOpen(false)
                }}
                className="no-drag w-full flex items-center gap-2 text-start text-[12.5px] font-medium px-3 py-2.5 hover:bg-black/5 text-ink border-b border-line/60"
              >
                <Save size={13} className="text-ink-soft" />
                {t.books.saveCurrentAsDraft}
              </button>
              {chapter.drafts.length === 0 ? (
                <div className="px-3 py-3 text-[12px] text-ink-soft">{t.books.noSavedDrafts}</div>
              ) : (
                <div className="max-h-56 overflow-y-auto scrollbar-thin">
                  {[...chapter.drafts].reverse().map((d) => (
                    <div key={d.id} className="flex items-center gap-1 px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          restoreChapterDraft(chapter.id, d.id)
                          setDraftsOpen(false)
                        }}
                        className="no-drag flex-1 text-start text-[12.5px] px-2.5 py-2 rounded-lg hover:bg-black/5 text-ink truncate"
                      >
                        {d.label}
                      </button>
                      <button
                        type="button"
                        title={t.books.deleteDraft}
                        onClick={() => deleteChapterDraft(chapter.id, d.id)}
                        className="no-drag p-1.5 text-ink-soft/60 hover:text-rose"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!isToc && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setAssistOpen((v) => !v)}
              className="no-drag flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink"
            >
              <Sparkles size={13} />
              {t.books.aiAssistant}
              <ChevronDown size={12} className={clsx("transition-transform", assistOpen && "rotate-180")} />
            </button>
            {assistOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-paper-raised border border-line rounded-xl shadow-lg z-50 overflow-hidden">
                <button type="button" onClick={() => runAssist("summarize")} className="no-drag w-full text-start text-[12.5px] font-medium px-3 py-2.5 hover:bg-black/5 text-ink">
                  {t.books.summarizeChapter}
                </button>
                <button type="button" onClick={() => runAssist("edits")} className="no-drag w-full text-start text-[12.5px] font-medium px-3 py-2.5 hover:bg-black/5 text-ink border-t border-line/60">
                  {t.books.suggestEdits}
                </button>
                <button type="button" onClick={() => runAssist("clarity")} className="no-drag w-full text-start text-[12.5px] font-medium px-3 py-2.5 hover:bg-black/5 text-ink border-t border-line/60">
                  {t.books.improveClarity}
                </button>
              </div>
            )}
          </div>
        )}

        {!isToc && chapter.kind === "chapter" && (
          <button
            type="button"
            onClick={handleContinue}
            disabled={continueLoading}
            className="no-drag flex items-center gap-1.5 text-[12.5px] font-medium text-blue hover:text-ink disabled:opacity-50 shrink-0"
          >
            <Wand2 size={13} className={clsx(continueLoading && "animate-pulse")} />
            {t.books.continueScene}
          </button>
        )}
      </div>

      {!isToc && (
        <div className="print:hidden">
          <TemplateDocToolbar editor={editor} onExport={handleExport} onDelete={handleDelete} onSaveNow={() => useAppStore.getState().saveNow()} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin print:overflow-visible">
        {isToc ? (
          <div className="max-w-[720px] mx-auto my-10 px-16 py-14 bg-paper-raised rounded-lg shadow-md">
            <h2 className="font-serif text-[22px] font-medium text-ink mb-1">{t.books.tocTitle}</h2>
            <p className="text-[12.5px] text-ink-soft mb-6">{t.books.tocHint}</p>
            <div className="space-y-2">
              {siblingChapters
                .filter((c) => c.id !== chapter.id && c.kind !== "front")
                .map((c, i, arr) => (
                  <div key={c.id} className="flex items-center justify-between text-[14px] text-ink border-b border-dotted border-line/60 pb-1.5">
                    <span>{c.kind === "chapter" ? `${t.books.chapterLabel} ${arr.filter((x) => x.kind === "chapter").indexOf(c) + 1}: ${c.title || t.books.untitledChapter}` : labels[c.sectionType ?? ""] ?? c.title}</span>
                    <span className="text-ink-soft">{i + 1}</span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "mx-auto my-10 bg-paper-raised rounded-lg shadow-md print:shadow-none print:my-0 print:max-w-none",
              isBlueprintChapter
                ? clsx("book-page-canvas", `style-${project?.stylePreset}`, isDropCapEligible && "book-dropcap")
                : "max-w-[720px] px-16 py-14"
            )}
          >
            {isBlueprintChapter && (
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-soft/60 mb-8 pb-2 border-b border-line/40">
                <span>{project?.title || t.books.untitledManuscript}</span>
                <span>{project?.authorName || ""}</span>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        )}

        {(assistLoading || assistError || assistResult) && (
          <div className="max-w-[720px] mx-auto mb-10 -mt-4 px-6">
            <div className="rounded-xl border border-amber/25 bg-amber-soft/40 p-4">
              {assistLoading && <div className="text-[13px] text-ink-soft animate-pulse">{t.books.thinking}</div>}
              {assistError && <div className="text-[13px] text-rose">{assistError}</div>}
              {assistResult && (
                <div>
                  <div className="text-[13px] leading-relaxed text-ink whitespace-pre-wrap mb-3">{assistResult.text}</div>
                  <div className="flex items-center gap-3">
                    {assistResult.kind === "clarity" && (
                      <button type="button" onClick={applyClarityRewrite} className="no-drag text-[12.5px] font-medium text-blue hover:text-ink">
                        {t.books.replaceChapterWithThis}
                      </button>
                    )}
                    <button type="button" onClick={() => setAssistResult(null)} className="no-drag text-[12.5px] text-ink-soft hover:text-ink">
                      {t.books.dismiss}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(continueLoading || continueError || continuations) && (
          <div className="max-w-[720px] mx-auto mb-10 -mt-4 px-6">
            <div className="rounded-xl border border-blue/20 bg-blue/6 p-4">
              {continueLoading && <div className="text-[13px] text-ink-soft animate-pulse">{t.books.thinkingDirections}</div>}
              {continueError && <div className="text-[13px] text-rose">{continueError}</div>}
              {continuations && (
                <div className="space-y-2.5">
                  {continuations.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertContinuation(opt)}
                      className="no-drag w-full text-start text-[13px] leading-relaxed text-ink p-3 rounded-lg bg-paper-raised border border-line/60 hover:border-blue/40 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function safeParse(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")
}
