import { format, parseISO } from "date-fns"
import { Bell } from "lucide-react"
import { useUiStore } from "../../store/uiStore"
import type { CalendarEntry } from "../../types"

export function UpcomingCard({ entry }: { entry: CalendarEntry }) {
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  const date = parseISO(entry.date)

  return (
    <button
      type="button"
      onClick={() => setActiveModule("calendar")}
      className="no-drag w-full text-left rounded-xl border border-line/70 bg-paper-raised px-4 py-3 flex items-center gap-3.5 hover:border-ink/20 hover:bg-black/[0.02] transition-colors duration-200"
    >
      <div className="shrink-0 w-12 h-12 rounded-lg bg-amber-soft text-ink flex flex-col items-center justify-center leading-none">
        <div className="text-[15px] font-bold">{format(date, "d")}</div>
        <div className="text-[9.5px] uppercase tracking-wide text-ink-soft">{format(date, "MMM")}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-amber font-medium mb-0.5">
          <Bell size={10} />
          {format(date, "EEEE")}
        </div>
        <div className="text-[13px] text-ink leading-snug truncate">{entry.text}</div>
      </div>
    </button>
  )
}
