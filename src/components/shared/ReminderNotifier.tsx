import { useEffect, useRef } from "react"
import { format } from "date-fns"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import type { CalendarEntry } from "../../types"

export function ReminderNotifier() {
  const { t } = useI18n()
  const entries = useAppStore((s) => s.calendarEntries)
  const updateEntry = useAppStore((s) => s.updateCalendarEntry)
  const entriesRef = useRef<CalendarEntry[]>(entries)

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  useEffect(() => {
    const checkDue = () => {
      const now = new Date()
      const todayKey = format(now, "yyyy-MM-dd")
      const nowHHMM = format(now, "HH:mm")
      for (const e of entriesRef.current) {
        if (e.kind !== "reminder" || e.done || e.notified || !e.time) continue
        if (e.date !== todayKey || e.time > nowHHMM) continue
        window.myna?.notify.show({ title: t.calendar.reminderNotifTitle, body: `${e.time} ${e.text}` })
        updateEntry(e.id, { notified: true })
      }
    }

    checkDue()
    const id = window.setInterval(checkDue, 30_000)
    return () => window.clearInterval(id)
  }, [updateEntry, t])

  return null
}
