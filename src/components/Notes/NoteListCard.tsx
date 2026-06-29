import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import clsx from "clsx"
import { FileText, MoreHorizontal, Pin, Copy, FileDown, FileType, Trash2, Pencil } from "lucide-react"
import type { Note } from "../../types"
import { useUiStore } from "../../store/uiStore"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { isNoteEmpty } from "../../lib/noteEmpty"
import { exportNoteAsDocx, exportNoteAsMyna, exportNoteAsPdf, notePlainText } from "../../lib/exportNote"

const STATUS_STYLES = {
  pinned: { text: "text-amber", iconBg: "bg-amber/12" },
  draft: { text: "text-ink-soft", iconBg: "bg-black/6" },
  note: { text: "text-sage", iconBg: "bg-blue/12" },
}

export function NoteListCard({ note }: { note: Note }) {
  const { t } = useI18n()
  const openEditor = useUiStore((s) => s.openEditor)
  const togglePin = useAppStore((s) => s.togglePin)
  const deleteNote = useAppStore((s) => s.deleteNote)
  const createNote = useAppStore((s) => s.createNote)
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  const status = note.pinned ? "pinned" : isNoteEmpty(note) ? "draft" : "note"
  const statusLabel = status === "pinned" ? t.notes.statusPinned : status === "draft" ? t.notes.statusDraft : t.notes.statusNote
  const style = STATUS_STYLES[status]
  const wordCount = notePlainText(note).split(/\s+/).filter(Boolean).length

  const run = (fn: () => void) => {
    fn()
    setMenuOpen(false)
  }

  const duplicate = () => {
    const copy = createNote({
      title: note.title ? `${note.title} (copy)` : "",
      content: note.content,
      preview: note.preview,
      tags: note.tags,
    })
    openEditor(copy.id)
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        "anim-item group relative flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-paper-raised hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-150",
        menuOpen && "z-30"
      )}
    >
      <button type="button" onClick={() => openEditor(note.id)} className="no-drag flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className={clsx("w-9 h-9 rounded-lg grid place-items-center shrink-0", style.iconBg)}>
          <FileText size={16} className={style.text} />
        </div>
        <div className="min-w-0 flex-1">
          <div dir="auto" className="text-[14px] font-medium text-ink truncate">
            {note.title || t.editor.untitled}
          </div>
          <div dir="auto" className="text-[12px] text-ink-soft truncate">
            {note.preview || "—"}
          </div>
        </div>
      </button>

      <span className={clsx("hidden md:inline-block w-24 shrink-0 text-center text-[12px] font-medium", style.text)}>{statusLabel}</span>
      <span className="hidden md:inline-block w-20 shrink-0 text-center text-[12px] text-ink-soft/70">
        {wordCount} {t.notes.words}
      </span>
      <span className="hidden md:inline-block w-28 shrink-0 text-right text-[12px] text-ink-soft/70">{format(note.updatedAt, "MMM d, yyyy")}</span>

      <div className="relative shrink-0">
        <button
          type="button"
          title={t.common.more}
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
          }}
          className="no-drag w-8 h-8 rounded-lg grid place-items-center text-ink-soft/60 hover:text-ink hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div className="no-drag absolute right-0 top-full mt-1 z-30 w-44 bg-paper-raised border border-line rounded-xl shadow-lg py-1.5">
            <MenuAction icon={Pencil} label={t.common.edit} onClick={() => run(() => openEditor(note.id))} />
            <MenuAction icon={Pin} label={note.pinned ? t.notes.unpin : t.notes.pin} onClick={() => run(() => togglePin(note.id))} />
            <MenuAction icon={Copy} label={t.notes.duplicate} onClick={() => run(duplicate)} />
            <div className="my-1 h-px bg-line/70" />
            <MenuAction icon={FileDown} label={t.editor.exportPdf} onClick={() => run(() => exportNoteAsPdf(note))} />
            <MenuAction icon={FileType} label={t.editor.exportDocx} onClick={() => run(() => exportNoteAsDocx(note))} />
            <MenuAction icon={FileText} label={t.editor.exportMyna} onClick={() => run(() => exportNoteAsMyna(note))} />
            <div className="my-1 h-px bg-line/70" />
            <MenuAction icon={Trash2} label={t.common.delete} tone="danger" onClick={() => run(() => deleteNote(note.id))} />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuAction({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: typeof Pin
  label: string
  onClick: () => void
  tone?: "default" | "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium hover:bg-black/5 transition-colors text-left",
        tone === "danger" ? "text-rose" : "text-ink"
      )}
    >
      <Icon size={14} className="shrink-0 text-ink-soft" />
      <span className="truncate">{label}</span>
    </button>
  )
}
