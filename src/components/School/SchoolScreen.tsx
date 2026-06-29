import { useState } from "react"
import { ArrowLeft, Plus, GraduationCap, NotebookText, Trash2, Sparkles, FileText, Layers, ClipboardList, Link2, Clock } from "lucide-react"
import clsx from "clsx"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { ScreenHeader } from "../shared/ScreenHeader"
import { NoteCard } from "../Notes/NoteCard"
import { useGsapStagger } from "../../lib/useGsapStagger"
import { runAi, parseFlashcards } from "../../lib/ai"
import { notePlainText } from "../../lib/exportNote"
import { FlashcardStudy } from "./FlashcardStudy"
import type { Note } from "../../types"

type NotebookTab = "notes" | "assignments" | "summaries" | "flashcards" | "resources"

const colorMap = {
  amber: "bg-amber-soft text-amber",
  blue: "bg-blue/15 text-blue",
  sage: "bg-sage/15 text-sage",
  rose: "bg-rose/15 text-rose",
}

function AddClassTile({ label, onCreate }: { label: string; onCreate: (name: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")

  const submit = () => {
    if (name.trim()) onCreate(name.trim())
    setName("")
    setAdding(false)
  }

  if (adding) {
    return (
      <div className="anim-item rounded-2xl border border-dashed border-ink/30 bg-paper-raised p-4 flex flex-col gap-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onBlur={submit}
          placeholder={label}
          className="w-full bg-transparent outline-none text-[14px] font-medium text-ink"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setAdding(true)}
      className="anim-item no-drag rounded-2xl border border-dashed border-line text-ink-soft hover:border-ink/30 hover:text-ink p-5 flex flex-col items-center justify-center gap-2.5 transition-colors min-h-[140px]"
    >
      <Plus size={20} />
      <span className="text-[14px] font-medium">{label}</span>
    </button>
  )
}

export function SchoolScreen() {
  const { t } = useI18n()
  const classes = useAppStore((s) => s.classes)
  const createClass = useAppStore((s) => s.createClass)
  const deleteClass = useAppStore((s) => s.deleteClass)
  const [openId, setOpenId] = useState<string | null>(null)
  const ref = useGsapStagger()

  const open = classes.find((c) => c.id === openId)
  if (open) return <ClassDetail classId={open.id} onBack={() => setOpenId(null)} />

  return (
    <div className="p-12 w-full">
      <ScreenHeader title={t.school.title} subtitle={t.school.subtitle} />

      <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="anim-item relative group">
            <button
              type="button"
              onClick={() => setOpenId(c.id)}
              className="no-drag w-full text-left rounded-2xl border border-line bg-paper-raised p-5 min-h-[140px] flex flex-col hover:border-ink/25 hover:bg-black/[0.02] transition-colors duration-200"
            >
              <div className={clsx("w-12 h-12 rounded-xl grid place-items-center text-[22px] mb-4", colorMap[c.color])}>
                {c.emoji}
              </div>
              <div className="text-[15.5px] font-semibold text-ink truncate">{c.name}</div>
            </button>
            <button
              type="button"
              title={t.editor.delete}
              onClick={(e) => {
                e.stopPropagation()
                deleteClass(c.id)
              }}
              className="no-drag absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <AddClassTile label={t.school.newClass} onCreate={(name) => createClass(name)} />
      </div>

      {classes.length === 0 && (
        <div className="anim-item text-center py-12 text-ink-soft text-[14.5px] flex flex-col items-center gap-2.5">
          <GraduationCap size={26} className="opacity-40" />
          {t.school.empty}
        </div>
      )}
    </div>
  )
}

function ClassDetail({ classId, onBack }: { classId: string; onBack: () => void }) {
  const { t } = useI18n()
  const cls = useAppStore((s) => s.classes.find((c) => c.id === classId))
  const allNotebooks = useAppStore((s) => s.notebooks)
  const allNotes = useAppStore((s) => s.notes)
  const allFlashcards = useAppStore((s) => s.flashcards)
  const createNotebook = useAppStore((s) => s.createNotebook)
  const deleteNotebook = useAppStore((s) => s.deleteNotebook)
  const openEditor = useUiStore((s) => s.openEditor)
  const [openNotebookId, setOpenNotebookId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const ref = useGsapStagger()

  if (!cls) return null

  const notebooks = allNotebooks.filter((n) => n.classId === classId)
  const notes = allNotes.filter((n) => n.classId === classId)

  const openNotebook = notebooks.find((n) => n.id === openNotebookId)
  if (openNotebook) {
    return <NotebookDetail notebookId={openNotebook.id} onBack={() => setOpenNotebookId(null)} />
  }

  const submit = () => {
    if (!name.trim()) return
    createNotebook(classId, name.trim(), description.trim())
    setName("")
    setDescription("")
    setAdding(false)
  }

  const notebookIds = new Set(notebooks.map((n) => n.id))
  const classFlashcards = allFlashcards.filter((f) => notebookIds.has(f.notebookId))
  const dueCount = classFlashcards.filter((f) => f.dueAt <= Date.now()).length
  const masteryPct = classFlashcards.length ? Math.round((classFlashcards.filter((f) => f.reviews > 0).length / classFlashcards.length) * 100) : 0
  const recentNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4)
  const assignments = notes.filter((n) => (n.tags ?? []).includes("assignment"))

  return (
    <div className="p-12 w-full">
      <button type="button" onClick={onBack} className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink mb-8">
        <ArrowLeft size={14} />
        {t.editor.back}
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className={clsx("w-14 h-14 rounded-xl grid place-items-center text-[26px]", colorMap[cls.color])}>{cls.emoji}</div>
        <h1 className="font-serif text-[32px] font-medium text-ink">{cls.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
            <Clock size={13} />
            {t.school.recentNotes}
          </div>
          {recentNotes.length === 0 ? (
            <div className="text-[13px] text-ink-soft">{t.school.noNotes}</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {recentNotes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openEditor(n.id)}
                  className="no-drag text-left text-[13.5px] text-ink hover:text-amber truncate"
                >
                  {n.title || t.editor.untitled}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
            <ClipboardList size={13} />
            {t.school.tabAssignments}
          </div>
          <div className="text-[28px] font-serif text-ink mb-1">{assignments.length}</div>
          <div className="text-[12.5px] text-ink-soft">{t.school.dueForReview}: {dueCount}</div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center justify-between text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
            <span>{t.school.mastery}</span>
            <span className="text-ink">{masteryPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/6 overflow-hidden">
            <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${masteryPct}%` }} />
          </div>
          <div className="text-[12.5px] text-ink-soft mt-2">
            {t.school.flashcardsAcrossNotebooks.replace("{count}", String(classFlashcards.length)).replace("{n}", String(notebooks.length))}
          </div>
        </div>
      </div>

      <div className="text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide mb-4">{t.school.notebooks}</div>

      <div ref={ref} className="flex flex-col gap-3 mb-8">
        {notebooks.map((nb) => {
          const nbNotes = notes.filter((n) => n.notebookId === nb.id)
          const nbAssignments = nbNotes.filter((n) => (n.tags ?? []).includes("assignment")).length
          const nbSummaries = nbNotes.filter((n) => (n.tags ?? []).includes("summary")).length
          const nbResources = nbNotes.filter((n) => (n.tags ?? []).includes("resource")).length
          const nbFlashcards = allFlashcards.filter((f) => f.notebookId === nb.id).length
          return (
            <div key={nb.id} className="anim-item relative group">
              <button
                type="button"
                onClick={() => setOpenNotebookId(nb.id)}
                className="no-drag w-full text-left rounded-2xl border border-line bg-paper-raised p-4 pr-14 hover:border-ink/25 hover:bg-black/[0.02] transition-colors duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue/12 text-blue grid place-items-center text-[22px]">{nb.emoji}</div>
                <div className="min-w-[160px] max-w-[260px]">
                  <div className="text-[15.5px] font-semibold text-ink truncate">{nb.name}</div>
                  <div className="text-[13px] text-ink-soft mt-0.5 leading-snug line-clamp-1">{nb.description || " "}</div>
                </div>
                <div className="flex-1 flex items-center gap-6 pl-2">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <ClipboardList size={15} />
                    <span className="text-[13.5px] text-ink">{nbAssignments}</span>
                    <span className="text-[12px]">{t.school.tabAssignments}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Sparkles size={15} />
                    <span className="text-[13.5px] text-ink">{nbSummaries}</span>
                    <span className="text-[12px]">{t.school.tabSummaries}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Layers size={15} />
                    <span className="text-[13.5px] text-ink">{nbFlashcards}</span>
                    <span className="text-[12px]">{t.school.tabFlashcards}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Link2 size={15} />
                    <span className="text-[13.5px] text-ink">{nbResources}</span>
                    <span className="text-[12px]">{t.school.tabResources}</span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                title={t.editor.delete}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNotebook(nb.id)
                }}
                className="no-drag absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}

        {adding ? (
          <div className="anim-item rounded-2xl border border-dashed border-ink/30 bg-paper-raised p-4 flex items-center gap-2.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.school.notebookNamePlaceholder}
              className="flex-1 bg-transparent outline-none text-[15px] font-medium text-ink"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t.school.notebookDescPlaceholder}
              className="flex-1 bg-transparent outline-none text-[13px] text-ink-soft"
            />
            <button type="button" onClick={submit} className="no-drag shrink-0 text-[13px] font-medium bg-ink text-paper px-3.5 py-1.5 rounded-full">
              {t.school.create}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="anim-item no-drag rounded-2xl border border-dashed border-line text-ink-soft hover:border-ink/30 hover:text-ink p-4 flex items-center justify-center gap-2.5 transition-colors"
          >
            <Plus size={18} />
            <span className="text-[14px] font-medium">{t.school.newNotebook}</span>
          </button>
        )}
      </div>

      {notebooks.length === 0 && !adding && (
        <div className="text-center py-12 text-ink-soft text-[14.5px] flex flex-col items-center gap-2.5">
          <NotebookText size={26} className="opacity-40" />
          {t.school.noNotebooks}
        </div>
      )}
    </div>
  )
}

const tabIcon: Record<NotebookTab, typeof FileText> = {
  notes: FileText,
  assignments: ClipboardList,
  summaries: Sparkles,
  flashcards: Layers,
  resources: Link2,
}

function NotebookDetail({ notebookId, onBack }: { notebookId: string; onBack: () => void }) {
  const { t } = useI18n()
  const notebook = useAppStore((s) => s.notebooks.find((n) => n.id === notebookId))
  const allNotesRaw = useAppStore((s) => s.notes)
  const allFlashcardsRaw = useAppStore((s) => s.flashcards)
  const createNote = useAppStore((s) => s.createNote)
  const addFlashcards = useAppStore((s) => s.addFlashcards)
  const openEditor = useUiStore((s) => s.openEditor)
  const ref = useGsapStagger()

  const [tab, setTab] = useState<NotebookTab>("notes")
  const [busy, setBusy] = useState<"flashcards" | "summary" | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [studying, setStudying] = useState(false)

  if (!notebook) return null

  const allNotes = allNotesRaw.filter((n) => n.notebookId === notebookId)
  const flashcards = allFlashcardsRaw.filter((f) => f.notebookId === notebookId)

  const combinedText = () => allNotes.map((n) => `${n.title}\n${notePlainText(n)}`).join("\n\n")

  const generalNotes = allNotes.filter((n) => {
    const tags = n.tags ?? []
    return !tags.includes("assignment") && !tags.includes("resource") && !tags.includes("summary")
  })
  const assignmentNotes = allNotes.filter((n) => (n.tags ?? []).includes("assignment"))
  const summaryNotes = allNotes.filter((n) => (n.tags ?? []).includes("summary"))
  const resourceNotes = allNotes.filter((n) => (n.tags ?? []).includes("resource"))

  const addNote = (extraTag?: string) => {
    const note = createNote({ classId: notebook.classId, notebookId, tags: extraTag ? [extraTag] : [] })
    openEditor(note.id)
  }

  const generateFlashcards = async () => {
    if (allNotes.length === 0) return
    setBusy("flashcards")
    const res = await runAi("flashcards", combinedText())
    setBusy(null)
    if (res.text) {
      const cards = parseFlashcards(res.text)
      if (cards.length) addFlashcards(notebookId, cards)
    }
  }

  const generateSummary = async () => {
    if (allNotes.length === 0) return
    setBusy("summary")
    const res = await runAi("examSummary", combinedText())
    setBusy(null)
    setSummary(res.text ?? t.ai.error)
  }

  const saveSummaryAsNote = () => {
    if (!summary) return
    const note = createNote({
      classId: notebook.classId,
      notebookId,
      tags: ["summary"],
      title: `${notebook.name} — exam summary`,
      content: JSON.stringify({
        type: "doc",
        content: summary.split("\n").filter(Boolean).map((line) => ({ type: "paragraph", content: [{ type: "text", text: line }] })),
      }),
    })
    setSummary(null)
    openEditor(note.id)
  }

  const due = flashcards.filter((f) => f.dueAt <= Date.now())

  const tabs: NotebookTab[] = ["notes", "assignments", "summaries", "flashcards", "resources"]
  const tabLabel: Record<NotebookTab, string> = {
    notes: t.school.tabNotes,
    assignments: t.school.tabAssignments,
    summaries: t.school.tabSummaries,
    flashcards: t.school.tabFlashcards,
    resources: t.school.tabResources,
  }

  const renderNoteGrid = (list: Note[], emptyLabel: string) =>
    list.length === 0 ? (
      <div className="text-center py-16 text-ink-soft text-[14.5px] flex flex-col items-center gap-2.5">
        <FileText size={24} className="opacity-40" />
        {emptyLabel}
      </div>
    ) : (
      <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
        {list.map((n, i) => (
          <div key={n.id} className="anim-item">
            <NoteCard note={n} compact index={i} />
          </div>
        ))}
      </div>
    )

  return (
    <div className="p-12 w-full">
      {studying && <FlashcardStudy notebookId={notebookId} onClose={() => setStudying(false)} />}

      <button type="button" onClick={onBack} className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink mb-8">
        <ArrowLeft size={14} />
        {t.editor.back}
      </button>

      <div className="flex items-center gap-4 mb-1.5">
        <div className="w-14 h-14 rounded-xl bg-blue/12 text-blue grid place-items-center text-[26px]">{notebook.emoji}</div>
        <h1 className="font-serif text-[32px] font-medium text-ink">{notebook.name}</h1>
      </div>
      {notebook.description && <p className="text-[14.5px] text-ink-soft mb-8 ml-[72px]">{notebook.description}</p>}

      <div className="flex gap-1.5 mb-8 bg-black/4 rounded-full p-1 w-fit">
        {tabs.map((tb) => {
          const Icon = tabIcon[tb]
          return (
            <button
              key={tb}
              type="button"
              onClick={() => setTab(tb)}
              className={clsx(
                "no-drag flex items-center gap-1.5 text-[13.5px] font-medium px-4 py-2 rounded-full transition-colors",
                tab === tb ? "bg-paper-raised text-ink border border-line" : "text-ink-soft"
              )}
            >
              <Icon size={14} />
              {tabLabel[tb]}
            </button>
          )
        })}
      </div>

      {tab === "notes" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide">{t.school.tabNotes}</div>
            <button
              type="button"
              onClick={() => addNote()}
              className="no-drag flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
            >
              <Plus size={15} />
              {t.school.newNote}
            </button>
          </div>
          {renderNoteGrid(generalNotes, t.school.noNotes)}
        </>
      )}

      {tab === "assignments" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide">{t.school.tabAssignments}</div>
            <button
              type="button"
              onClick={() => addNote("assignment")}
              className="no-drag flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
            >
              <Plus size={15} />
              {t.school.newAssignment}
            </button>
          </div>
          {renderNoteGrid(assignmentNotes, t.school.noAssignments)}
        </>
      )}

      {tab === "resources" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide">{t.school.tabResources}</div>
            <button
              type="button"
              onClick={() => addNote("resource")}
              className="no-drag flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
            >
              <Plus size={15} />
              {t.school.newResource}
            </button>
          </div>
          {renderNoteGrid(resourceNotes, t.school.noResources)}
        </>
      )}

      {tab === "summaries" && (
        <>
          <div className="rounded-2xl border border-line bg-paper-raised p-5 mb-7 max-w-[600px]">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-blue uppercase tracking-wide mb-3">
              <Sparkles size={14} />
              {t.school.examSummary}
            </div>
            <button
              type="button"
              disabled={busy !== null || allNotes.length === 0}
              onClick={generateSummary}
              className="no-drag text-left text-[14.5px] text-ink hover:text-blue disabled:opacity-40"
            >
              {busy === "summary" ? t.school.generatingSummary : t.school.examSummary}
            </button>
            {allNotes.length === 0 && <p className="text-[13px] text-ink-soft mt-2">{t.school.needNotesFirst}</p>}
          </div>

          {summary && (
            <div className="rounded-2xl border border-blue/20 bg-blue/5 p-6 mb-9 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink max-w-[1100px]">
              {summary}
              <div className="mt-4">
                <button type="button" onClick={saveSummaryAsNote} className="no-drag text-[13px] px-4 py-2 rounded-full bg-ink text-paper">
                  {t.school.insertAsNote}
                </button>
              </div>
            </div>
          )}

          {renderNoteGrid(summaryNotes, t.school.noSummaries)}
        </>
      )}

      {tab === "flashcards" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-[800px]">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-amber uppercase tracking-wide mb-3">
              <Layers size={14} />
              {t.school.studyTools}
            </div>
            <button
              type="button"
              disabled={busy !== null || allNotes.length === 0}
              onClick={generateFlashcards}
              className="no-drag w-full text-left text-[14.5px] text-ink hover:text-amber disabled:opacity-40 py-1.5"
            >
              {busy === "flashcards" ? t.school.generatingFlashcards : t.school.generateFlashcards}
            </button>
            {allNotes.length === 0 && <p className="text-[13px] text-ink-soft mt-2">{t.school.needNotesFirst}</p>}
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-sage uppercase tracking-wide mb-3">
              <NotebookText size={14} />
              {t.school.studyNow}
            </div>
            <button
              type="button"
              disabled={flashcards.length === 0}
              onClick={() => setStudying(true)}
              className="no-drag w-full text-left text-[14.5px] text-ink hover:text-sage disabled:opacity-40 py-1.5"
            >
              {flashcards.length === 0 ? t.school.noFlashcardsYet : `${due.length} ${t.school.dueCards} · ${flashcards.length} total`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
