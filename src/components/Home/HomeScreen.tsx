import { useMemo } from "react"
import {
  Smile,
  HeartHandshake,
  Mail,
  Timer,
  MessageSquare,
  GraduationCap,
  Clock,
} from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { InlineNoteEditor } from "./InlineNoteEditor"
import { IdeaRotator } from "./IdeaRotator"
import { VisitedCard } from "./VisitedCard"
import { UpcomingCard } from "./UpcomingCard"
import { useGsapStagger } from "../../lib/useGsapStagger"
import { AnimatedLogo } from "../shared/AnimatedLogo"
import type { ModuleKey } from "../../types"

export function HomeScreen() {
  const { t } = useI18n()
  const notes = useAppStore((s) => s.notes)
  const calendarEntries = useAppStore((s) => s.calendarEntries)
  const settings = useAppStore((s) => s.settings)
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  const ref = useGsapStagger()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t.home.greetingMorning : hour < 18 ? t.home.greetingAfternoon : t.home.greetingEvening

  const visited = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6),
    [notes]
  )
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = useMemo(
    () =>
      calendarEntries
        .filter((e) => e.kind === "reminder" && e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6),
    [calendarEntries, today]
  )

  const quickLinks: { key: ModuleKey; icon: typeof Smile; label: string }[] = [
    { key: "mood", icon: Smile, label: t.home.moodCheckIn },
    { key: "gratitude", icon: HeartHandshake, label: t.home.gratitudeQuick },
    { key: "letters", icon: Mail, label: t.home.unsentLetters },
    { key: "stream", icon: Timer, label: t.home.streamWriting },
    { key: "dialogue", icon: MessageSquare, label: t.home.dialogueWriting },
    { key: "school", icon: GraduationCap, label: t.nav.school },
  ]

  return (
    <div className="px-12 py-10 w-full">
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2.5 mb-3 anim-item">
          <div className="home-greeting-logo shrink-0">
            <AnimatedLogo size={40} />
          </div>
          <h1 className="font-serif text-[24px] font-medium text-ink-soft">
            {greeting}{settings.userName ? `, ${settings.userName}` : ""}
          </h1>
        </div>

        <div className="text-center mb-10 anim-item">
          <IdeaRotator />
        </div>

        <div className="anim-item w-full">
          <InlineNoteEditor />
        </div>

        <div className="anim-item flex items-center justify-center gap-x-7 gap-y-2 flex-wrap mt-6 px-4">
          {quickLinks.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveModule(key)}
              className="no-drag flex items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-ink transition-colors"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="anim-item flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
            <Clock size={12} />
            {t.home.recent}
          </div>
          {visited.length === 0 ? (
            <div className="anim-item text-[13px] text-ink-soft rounded-2xl border border-dashed border-line p-6 text-center">
              {t.home.recentEmpty}
            </div>
          ) : (
            <div className="anim-item flex flex-col gap-2.5">
              {visited.map((n) => (
                <VisitedCard key={n.id} note={n} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="anim-item flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
            {t.home.upcoming}
          </div>
          {upcoming.length === 0 ? (
            <div className="anim-item text-[13px] text-ink-soft rounded-2xl border border-dashed border-line p-6 text-center">
              {t.home.upcomingEmpty}
            </div>
          ) : (
            <div className="anim-item flex flex-col gap-2.5">
              {upcoming.map((e) => (
                <UpcomingCard key={e.id} entry={e} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
