import { FileText, Pin } from "lucide-react"
import clsx from "clsx"
import { useUiStore } from "../../store/uiStore"
import { gradientFor } from "../../lib/colorHash"
import type { Note } from "../../types"

export function VisitedCard({ note }: { note: Note }) {
  const openEditor = useUiStore((s) => s.openEditor)

  return (
    <button
      type="button"
      onClick={() => openEditor(note.id)}
      className="no-drag group w-full flex items-center gap-3.5 text-left rounded-xl border border-line/70 bg-paper-raised px-4 py-3 hover:border-ink/20 hover:bg-black/[0.02] transition-colors duration-200"
    >
      <div className={clsx("shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br grid place-items-center", gradientFor(note.id))}>
        <FileText size={15} className="text-ink-soft" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-ink truncate">{note.title || "Untitled note"}</div>
      </div>
      {note.pinned && <Pin size={13} className="shrink-0 text-amber" fill="currentColor" />}
    </button>
  )
}
