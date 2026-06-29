import { useEffect, useMemo, useRef, useState } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import clsx from "clsx"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Bell,
  StickyNote,
  CheckSquare,
  Square,
  ArrowLeft,
  Trash2,
  Clock,
} from "lucide-react"
import gsap from "gsap"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { ScreenHeader } from "../shared/ScreenHeader"
import { colorForEntry } from "../../lib/colorHash"
import {
  dateToJalali,
  formatJalaliLong,
  formatJalaliMonthYear,
  jalaaliMonthLength,
  jalaaliToGregorian,
  jalaliWeekdayShortDa,
} from "../../lib/jalali"
import type { CalendarEntry } from "../../types"

type ModalMode = "list" | "reminder" | "note"

export function CalendarScreen() {
  const { t, lang } = useI18n()
  const isDari = lang === "da"

  const [gCursor, setGCursor] = useState(new Date())
  const [jCursor, setJCursor] = useState(() => {
    const j = dateToJalali(new Date())
    return { jy: j.jy, jm: j.jm }
  })
  const [activeDate, setActiveDate] = useState<Date | null>(null)
  const [mode, setMode] = useState<ModalMode>("list")
  const [text, setText] = useState("")
  const [time, setTime] = useState("")
  const [taskFlag, setTaskFlag] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const entries = useAppStore((s) => s.calendarEntries)
  const addEntry = useAppStore((s) => s.addCalendarEntry)
  const updateEntry = useAppStore((s) => s.updateCalendarEntry)
  const removeEntry = useAppStore((s) => s.removeCalendarEntry)

  const days = useMemo(() => {
    if (isDari) {
      const monthLen = jalaaliMonthLength(jCursor.jy, jCursor.jm)
      const firstG = jalaaliToGregorian(jCursor.jy, jCursor.jm, 1)
      const lastG = jalaaliToGregorian(jCursor.jy, jCursor.jm, monthLen)
      const start = startOfWeek(firstG, { weekStartsOn: 6 })
      const end = endOfWeek(lastG, { weekStartsOn: 6 })
      return eachDayOfInterval({ start, end })
    }
    const start = startOfWeek(startOfMonth(gCursor))
    const end = endOfWeek(endOfMonth(gCursor))
    return eachDayOfInterval({ start, end })
  }, [isDari, jCursor, gCursor])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    for (const e of entries) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.createdAt - b.createdAt)
    return map
  }, [entries])

  const monthKeys = useMemo(() => new Set(days.map((d) => format(d, "yyyy-MM-dd"))), [days])
  const monthSummary = useMemo(() => {
    let reminders = 0
    let notes = 0
    for (const e of entries) {
      if (!monthKeys.has(e.date)) continue
      if (e.kind === "reminder") reminders += 1
      else notes += 1
    }
    return { reminders, notes }
  }, [entries, monthKeys])

  const activeKey = activeDate ? format(activeDate, "yyyy-MM-dd") : null
  const activeEntries = activeKey ? entriesByDate.get(activeKey) ?? [] : []

  useEffect(() => {
    if (activeDate && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.92, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "back.out(1.5)" }
      )
    }
  }, [activeDate, mode])

  useEffect(() => {
    if (!activeDate) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveDate(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeDate])

  const goPrevMonth = () => {
    if (isDari) {
      setJCursor((c) => (c.jm === 1 ? { jy: c.jy - 1, jm: 12 } : { jy: c.jy, jm: c.jm - 1 }))
    } else {
      setGCursor((c) => subMonths(c, 1))
    }
  }

  const goNextMonth = () => {
    if (isDari) {
      setJCursor((c) => (c.jm === 12 ? { jy: c.jy + 1, jm: 1 } : { jy: c.jy, jm: c.jm + 1 }))
    } else {
      setGCursor((c) => addMonths(c, 1))
    }
  }

  const goToday = () => {
    setGCursor(new Date())
    const j = dateToJalali(new Date())
    setJCursor({ jy: j.jy, jm: j.jm })
  }

  const openDay = (d: Date) => {
    setActiveDate(d)
    setMode("list")
    setText("")
    setTime("")
    setTaskFlag(false)
  }

  const closeModal = () => setActiveDate(null)

  const startCompose = (next: ModalMode) => {
    setMode(next)
    setText("")
    setTime("")
    setTaskFlag(false)
  }

  const openTimePicker = () => {
    const el = timeInputRef.current
    if (!el) return
    el.focus()
    const withPicker = el as HTMLInputElement & { showPicker?: () => void }
    if (typeof withPicker.showPicker === "function") {
      try {
        withPicker.showPicker()
      } catch {
        // ignore unsupported / not-user-gesture errors
      }
    }
  }

  const submitOnEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>, submit: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submitReminder = () => {
    if (!text.trim() || !activeKey) return
    addEntry({ date: activeKey, kind: "reminder", text: text.trim(), time: time || undefined, isTask: true })
    setText("")
    setTime("")
    setMode("list")
  }

  const submitNote = () => {
    if (!text.trim() || !activeKey) return
    addEntry({ date: activeKey, kind: "note", text: text.trim(), isTask: taskFlag })
    setText("")
    setTaskFlag(false)
    setMode("list")
  }

  const monthLabel = isDari ? formatJalaliMonthYear(jCursor.jy, jCursor.jm) : format(gCursor, "MMMM yyyy")
  const weekdayLabels = isDari ? jalaliWeekdayShortDa : days.slice(0, 7).map((d) => format(d, "EEEEEE"))

  return (
    <div className="h-full flex flex-col p-8">
      <ScreenHeader
        title={t.calendar.title}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] text-ink-soft">
              <span className="flex items-center gap-1 bg-amber-soft text-amber px-2 py-1 rounded-full font-medium">
                <Bell size={11} /> {monthSummary.reminders}
              </span>
              <span className="flex items-center gap-1 bg-blue/15 text-blue px-2 py-1 rounded-full font-medium">
                <StickyNote size={11} /> {monthSummary.notes}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title={t.calendar.previousMonth}
                onClick={goPrevMonth}
                className="no-drag w-9 h-9 grid place-items-center rounded-lg hover:bg-black/5 text-ink-soft"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="font-serif text-[17px] text-ink w-[160px] text-center">{monthLabel}</div>
              <button
                type="button"
                title={t.calendar.nextMonth}
                onClick={goNextMonth}
                className="no-drag w-9 h-9 grid place-items-center rounded-lg hover:bg-black/5 text-ink-soft"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={goToday}
                className="no-drag text-[13.5px] px-3 h-9 rounded-lg hover:bg-black/5 text-ink-soft"
              >
                {t.calendar.today}
              </button>
            </div>
          </div>
        }
      />

      <div className="flex-1 min-h-0 rounded-2xl border border-line bg-paper-raised p-6 flex flex-col">
        <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
          {weekdayLabels.map((label, i) => (
            <div key={i} className="text-center text-[12.5px] text-ink-soft/70 font-medium">
              {label}
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-7 auto-rows-fr gap-2">
          {days.map((d) => {
            const isToday = isSameDay(d, new Date())
            const key = format(d, "yyyy-MM-dd")
            const dayEntries = entriesByDate.get(key) ?? []
            const hasEntries = dayEntries.length > 0
            const visible = dayEntries.slice(0, 3)
            const overflow = dayEntries.length - visible.length

            let dayNumber: string
            let inMonth: boolean
            if (isDari) {
              const j = dateToJalali(d)
              dayNumber = String(j.jd)
              inMonth = j.jy === jCursor.jy && j.jm === jCursor.jm
            } else {
              dayNumber = format(d, "d")
              inMonth = d.getMonth() === gCursor.getMonth() && d.getFullYear() === gCursor.getFullYear()
            }

            return (
              <div
                key={key}
                onClick={() => openDay(d)}
                className={clsx(
                  "no-drag rounded-xl flex flex-col items-stretch text-left pt-2.5 px-2 pb-2 relative transition-colors overflow-hidden border cursor-pointer",
                  isToday ? "border-amber bg-amber-soft/30" : "border-transparent hover:bg-black/5",
                  !inMonth && "text-ink-soft/30"
                )}
              >
                <span
                  className={clsx(
                    "text-[22px] leading-none px-1",
                    isToday ? "font-bold text-amber" : "font-semibold text-ink"
                  )}
                >
                  {dayNumber}
                </span>
                {hasEntries && (
                  <div className="mt-1.5 flex flex-col gap-1 overflow-hidden">
                    {visible.map((e) => {
                      const c = colorForEntry(e.id)
                      return (
                        <span
                          key={e.id}
                          className={clsx(
                            "flex items-center gap-1 rounded-md px-1.5 py-[3px] text-[12px] leading-tight font-medium",
                            c.bg,
                            c.text,
                            e.done && "opacity-50 line-through"
                          )}
                        >
                          {e.kind === "reminder" ? (
                            <Bell size={11} className="shrink-0" />
                          ) : e.isTask ? (
                            <button
                              type="button"
                              title={t.calendar.markFinished}
                              onClick={(ev) => {
                                ev.stopPropagation()
                                updateEntry(e.id, { done: !e.done })
                              }}
                              className="shrink-0 -m-0.5 p-0.5 rounded hover:bg-black/10"
                            >
                              {e.done ? <CheckSquare size={11} /> : <Square size={11} />}
                            </button>
                          ) : (
                            <StickyNote size={11} className="shrink-0" />
                          )}
                          <span className="truncate">
                            {e.time ? `${e.time} ` : ""}
                            {e.text}
                          </span>
                        </span>
                      )
                    })}
                    {overflow > 0 && (
                      <span className="text-[11px] text-ink-soft/70 px-1.5">
                        +{overflow} {t.calendar.moreItems}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center text-[12.5px] text-ink-soft/70 mt-3 shrink-0">{t.calendar.hint}</div>

      {activeDate && (
        <div className="fixed inset-0 z-[55] bg-black/40 flex items-center justify-center p-6" onClick={closeModal}>
          <div
            ref={modalRef}
            className="no-drag w-full max-w-[480px] bg-paper-raised rounded-[20px] border border-line shadow-2xl p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === "list" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[12.5px] text-ink-soft font-medium uppercase tracking-wide mb-0.5">
                      {isDari ? formatJalaliMonthYear(dateToJalali(activeDate).jy, dateToJalali(activeDate).jm) : format(activeDate, "MMMM yyyy")}
                    </div>
                    <div className="font-serif text-[22px] text-ink">
                      {isDari ? formatJalaliLong(activeDate) : format(activeDate, "EEEE, MMM d")}
                    </div>
                  </div>
                  <button
                    type="button"
                    title={t.calendar.close}
                    onClick={closeModal}
                    className="no-drag w-9 h-9 grid place-items-center rounded-full hover:bg-black/5 text-ink-soft/70 hover:text-ink"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="flex gap-2.5 mb-5">
                  <button
                    type="button"
                    onClick={() => startCompose("reminder")}
                    className="no-drag flex-1 flex items-center justify-center gap-2 text-[13.5px] py-3 rounded-xl bg-amber-soft text-amber font-semibold hover:brightness-95 transition"
                  >
                    <Bell size={15} /> {t.calendar.addReminder}
                  </button>
                  <button
                    type="button"
                    onClick={() => startCompose("note")}
                    className="no-drag flex-1 flex items-center justify-center gap-2 text-[13.5px] py-3 rounded-xl bg-blue/15 text-blue font-semibold hover:brightness-95 transition"
                  >
                    <StickyNote size={15} /> {t.calendar.addNote}
                  </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto scrollbar-thin space-y-2.5">
                  {activeEntries.length === 0 && (
                    <div className="text-[13.5px] text-ink-soft text-center py-8">{t.calendar.empty}</div>
                  )}
                  {activeEntries.map((e) => {
                    const c = colorForEntry(e.id)
                    return (
                      <div key={e.id} className="flex items-start gap-3 rounded-xl border px-4 py-3.5 bg-paper border-line/70">
                        <span className={clsx("mt-0.5 w-7 h-7 rounded-full grid place-items-center shrink-0", c.bg, c.text)}>
                          {e.isTask ? (
                            <button type="button" title={t.calendar.toggleDone} onClick={() => updateEntry(e.id, { done: !e.done })}>
                              {e.done ? <CheckSquare size={15} /> : <Square size={15} />}
                            </button>
                          ) : e.kind === "reminder" ? (
                            <Bell size={14} />
                          ) : (
                            <StickyNote size={14} />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={clsx("text-[14px] text-ink leading-snug", e.done && "line-through text-ink-soft")}>
                            {e.text}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {e.time && (
                              <span className="flex items-center gap-1 text-[11.5px] text-ink-soft">
                                <Clock size={11} /> {e.time}
                              </span>
                            )}
                            <span className="text-[11px] text-ink-soft/70 capitalize">
                              {e.kind === "reminder" ? t.calendar.newReminder : e.isTask ? t.calendar.markAsTask : t.calendar.newNote}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          title={t.calendar.remove}
                          onClick={() => removeEntry(e.id)}
                          className="no-drag text-ink-soft/50 hover:text-rose shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {mode === "reminder" && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <button
                    type="button"
                    title={t.calendar.back}
                    onClick={() => setMode("list")}
                    className="no-drag w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 text-ink-soft/70 hover:text-ink"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="w-9 h-9 rounded-full bg-amber-soft text-amber grid place-items-center shrink-0">
                    <Bell size={16} />
                  </span>
                  <div>
                    <div className="font-serif text-[18px] text-ink">{t.calendar.newReminder}</div>
                    <div className="text-[12px] text-ink-soft">
                      {isDari ? formatJalaliLong(activeDate) : format(activeDate, "EEEE, MMM d")}
                    </div>
                  </div>
                </div>
                <textarea
                  autoFocus
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => submitOnEnter(e, submitReminder)}
                  placeholder={t.calendar.reminderPlaceholder}
                  className="w-full bg-paper border border-line rounded-xl px-4 py-3.5 text-[16px] leading-snug outline-none focus:border-amber/50 mb-3 resize-none"
                />
                <div
                  onClick={openTimePicker}
                  className="flex items-center justify-between gap-2 bg-paper border border-line rounded-xl px-4 py-3 mb-5 cursor-pointer hover:border-amber/40 transition"
                >
                  <span className="flex items-center gap-1.5 text-[13.5px] text-ink-soft">
                    <Clock size={14} /> {t.calendar.time}
                  </span>
                  <input
                    ref={timeInputRef}
                    type="time"
                    title={t.calendar.time}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent outline-none text-[14px] text-ink text-right cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={submitReminder}
                  className="no-drag w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-ink text-paper text-[14px] font-semibold hover:opacity-90 transition"
                >
                  <Plus size={16} /> {t.calendar.add}
                </button>
              </>
            )}

            {mode === "note" && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <button
                    type="button"
                    title={t.calendar.back}
                    onClick={() => setMode("list")}
                    className="no-drag w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 text-ink-soft/70 hover:text-ink"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="w-9 h-9 rounded-full bg-blue/15 text-blue grid place-items-center shrink-0">
                    <StickyNote size={16} />
                  </span>
                  <div>
                    <div className="font-serif text-[18px] text-ink">{t.calendar.newNote}</div>
                    <div className="text-[12px] text-ink-soft">
                      {isDari ? formatJalaliLong(activeDate) : format(activeDate, "EEEE, MMM d")}
                    </div>
                  </div>
                </div>
                <textarea
                  autoFocus
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => submitOnEnter(e, submitNote)}
                  placeholder={t.calendar.notePlaceholder}
                  className="w-full bg-paper border border-line rounded-xl px-4 py-3.5 text-[16px] leading-snug outline-none focus:border-blue/40 mb-3 resize-none"
                />
                <label className="flex items-center gap-2 text-[13.5px] text-ink-soft mb-5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={taskFlag}
                    onChange={(e) => setTaskFlag(e.target.checked)}
                    className="w-4 h-4 accent-ink"
                  />
                  {t.calendar.markAsTask}
                </label>
                <button
                  type="button"
                  onClick={submitNote}
                  className="no-drag w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-ink text-paper text-[14px] font-semibold hover:opacity-90 transition"
                >
                  <Plus size={16} /> {t.calendar.add}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
