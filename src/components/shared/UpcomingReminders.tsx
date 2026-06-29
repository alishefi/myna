import { useEffect, useMemo, useRef, useState } from "react"
import { Bell, Square } from "lucide-react"
import { format, parseISO } from "date-fns"
import clsx from "clsx"
import gsap from "gsap"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { colorForEntry } from "../../lib/colorHash"
import type { CalendarEntry } from "../../types"

export function UpcomingReminders() {
  const { t } = useI18n()
  const entries = useAppStore((s) => s.calendarEntries)
  const updateEntry = useAppStore((s) => s.updateCalendarEntry)
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<CalendarEntry | null>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLSpanElement>(null)
  const upcomingRef = useRef<CalendarEntry[]>([])

  const today = format(new Date(), "yyyy-MM-dd")
  const upcoming = useMemo(
    () =>
      entries
        .filter((e) => e.date >= today && (e.kind === "reminder" || e.isTask) && !e.done)
        .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
        .slice(0, 8),
    [entries, today]
  )

  useEffect(() => {
    upcomingRef.current = upcoming
  }, [upcoming])

  useEffect(() => {
    if (open && popRef.current) {
      gsap.fromTo(
        popRef.current,
        { opacity: 0, y: 8, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" }
      )
    }
  }, [open])

  useEffect(() => {
    if (toast && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: 10, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" }
      )
    }
  }, [toast])

  const ringBell = () => {
    const el = bellRef.current
    if (!el) return
    gsap
      .timeline()
      .to(el, { rotate: -18, duration: 0.09, ease: "sine.inOut" })
      .to(el, { rotate: 16, duration: 0.09, ease: "sine.inOut" })
      .to(el, { rotate: -12, duration: 0.09, ease: "sine.inOut" })
      .to(el, { rotate: 9, duration: 0.09, ease: "sine.inOut" })
      .to(el, { rotate: -5, duration: 0.09, ease: "sine.inOut" })
      .to(el, { rotate: 0, duration: 0.2, ease: "back.out(2)" })
  }

  useEffect(() => {
    let dismissId: number
    let timeoutId: number

    const tick = () => {
      const list = upcomingRef.current
      if (list.length > 0) {
        ringBell()
        setToast(list[0])
        dismissId = window.setTimeout(() => setToast(null), 6000)
      }
      scheduleNext()
    }

    const scheduleNext = () => {
      const delay = (10 + Math.random() * 5) * 60 * 1000
      timeoutId = window.setTimeout(tick, delay)
    }

    scheduleNext()
    return () => {
      window.clearTimeout(timeoutId)
      window.clearTimeout(dismissId)
    }
  }, [])

  if (upcoming.length === 0 && !open) return null

  return (
    <div className="relative shrink-0 mb-1.5">
      <button
        type="button"
        onClick={() => {
          setToast(null)
          setOpen((v) => !v)
        }}
        className="no-drag w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] text-ink-soft hover:bg-black/[0.04] hover:text-ink transition-colors relative"
      >
        <span ref={bellRef} className="inline-flex">
          <Bell size={18} strokeWidth={2} className="opacity-75" />
        </span>
        {t.calendar.upcoming}
        {upcoming.length > 0 && (
          <span className="absolute right-3 top-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose text-white text-[10.5px] font-semibold grid place-items-center">
            {upcoming.length}
          </span>
        )}
      </button>

      {toast && !open && (
        <div
          ref={toastRef}
          onClick={() => {
            setToast(null)
            setOpen(true)
          }}
          className="no-drag absolute z-[60] bottom-full left-0 mb-2 w-[270px] bg-paper-raised border border-amber/40 rounded-xl shadow-xl p-3 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber mb-1">
            <Bell size={12} /> {t.calendar.upcoming}
          </div>
          <div className="text-[12.5px] text-ink truncate">
            {toast.time ? `${toast.time} ` : ""}
            {toast.text}
          </div>
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-[58]" onClick={() => setOpen(false)} />
          <div
            ref={popRef}
            className="absolute z-[59] bottom-full left-0 mb-2 w-[300px] max-h-[320px] overflow-y-auto scrollbar-thin bg-paper-raised border border-line rounded-2xl shadow-xl p-2.5"
          >
            {upcoming.length === 0 ? (
              <div className="text-[13px] text-ink-soft text-center py-6">{t.calendar.nothingUpcoming}</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {upcoming.map((e) => {
                  const c = colorForEntry(e.id)
                  return (
                    <div key={e.id} className={clsx("flex items-start gap-2 rounded-lg px-2.5 py-2", c.bg)}>
                      <button
                        type="button"
                        title={t.calendar.markFinished}
                        onClick={() => updateEntry(e.id, { done: true })}
                        className={clsx("no-drag mt-0.5 shrink-0 hover:opacity-70", c.text)}
                      >
                        <Square size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          setActiveModule("calendar")
                        }}
                        className="no-drag flex-1 flex items-start gap-2 text-left min-w-0"
                      >
                        <span className={clsx("text-[11px] font-semibold shrink-0 mt-0.5", c.text)}>
                          {format(parseISO(e.date), "MMM d")}
                        </span>
                        <span className="text-[12.5px] text-ink truncate">
                          {e.time ? `${e.time} ` : ""}
                          {e.text}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
