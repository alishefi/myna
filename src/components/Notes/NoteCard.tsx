import { Pin, ArrowUpRight, FileText, Sparkles, BookOpen, Star, Feather, Coffee } from "lucide-react"
import { format } from "date-fns"
import clsx from "clsx"
import type { Note } from "../../types"
import { useUiStore } from "../../store/uiStore"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"

const PALETTE = [
  { bg: "bg-sage", icon: BookOpen },
  { bg: "bg-blue", icon: FileText },
  { bg: "bg-amber", icon: Sparkles },
  { bg: "bg-rose", icon: Star },
  { bg: "bg-ink", icon: Feather },
  { bg: "bg-blue", icon: Coffee },
]

export function NoteCard({ note, index = 0 }: { note: Note; compact?: boolean; index?: number }) {
  const { t } = useI18n()
  const openEditor = useUiStore((s) => s.openEditor)
  const togglePin = useAppStore((s) => s.togglePin)
  const { bg, icon: Icon } = PALETTE[index % PALETTE.length]

  return (
    <button
      type="button"
      onClick={() => openEditor(note.id)}
      className={clsx(
        "no-drag group relative flex flex-col justify-between text-left rounded-3xl text-white overflow-hidden p-7 w-full aspect-[3/2]",
        "shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        bg
      )}
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/15 grid place-items-center backdrop-blur-sm">
          <Icon size={22} strokeWidth={2} />
        </div>
        <button
          type="button"
          title={note.pinned ? t.notes.unpin : t.notes.pin}
          onClick={(e) => {
            e.stopPropagation()
            togglePin(note.id)
          }}
          className={clsx(
            "transition-opacity hover:opacity-100",
            note.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-70"
          )}
        >
          <Pin size={18} fill={note.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div>
        <div dir="auto" className="text-start text-[22px] font-semibold truncate mb-2">
          {note.title || t.editor.untitled}
        </div>
        <div dir="auto" className="text-start text-[14px] text-white/70 line-clamp-2 mb-5 min-h-[2.6em]">
          {note.preview || format(note.updatedAt, "MMM d, HH:mm")}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-white/55">{format(note.updatedAt, "MMM d")}</span>
          <span className="w-9 h-9 rounded-full bg-white/15 grid place-items-center group-hover:bg-white/25 transition-colors">
            <ArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </button>
  )
}
