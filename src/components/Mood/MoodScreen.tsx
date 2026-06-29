import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import clsx from "clsx"
import { format, subDays } from "date-fns"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { moodActivities, moodQuotes } from "../../lib/quotes"
import { weekdayFullDa, formatHistoryTimestampDa } from "../../lib/dariDate"
import type { MoodValue } from "../../types"
import { MoodIcon } from "./MoodIcon"

const moods: { value: MoodValue; colorClass: string }[] = [
  { value: "great", colorClass: "text-amber" },
  { value: "good", colorClass: "text-sage" },
  { value: "okay", colorClass: "text-blue" },
  { value: "low", colorClass: "text-blue" },
  { value: "rough", colorClass: "text-rose" },
]

const cardStyle: Record<MoodValue, string> = {
  great: "bg-gradient-to-br from-amber to-[#c96a2e]",
  good: "bg-gradient-to-br from-sage to-[#5b7a64]",
  okay: "bg-gradient-to-br from-blue to-[#3c5fd1]",
  low: "bg-gradient-to-br from-blue to-sage",
  rough: "bg-gradient-to-br from-rose to-[#c05f6e]",
}

const cardShadow = "shadow-[0_14px_28px_-14px_rgba(27,28,30,0.28)]"

export function MoodScreen() {
  const { t, lang } = useI18n()
  const [selected, setSelected] = useState<MoodValue | null>(null)
  const [feeling, setFeeling] = useState("")
  const moodEntries = useAppStore((s) => s.moodEntries)
  const addMoodEntry = useAppStore((s) => s.addMoodEntry)
  const setMoodInsight = useUiStore((s) => s.setMoodInsight)
  const revealRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const weekRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const isLow = selected === "low" || selected === "rough"

  useEffect(() => {
    if (!cardsRef.current) return
    gsap.fromTo(
      cardsRef.current.children,
      { opacity: 0, y: 50, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: "back.out(1.5)", delay: 0.1 }
    )
    return () => setMoodInsight(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!historyRef.current) return
    gsap.fromTo(
      historyRef.current.children,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    )
  }, [moodEntries])

  useEffect(() => {
    if (!weekRef.current) return
    gsap.fromTo(
      weekRef.current.children,
      { opacity: 0, y: 14, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.7)", delay: 0.3 }
    )
  }, [])

  const pick = (m: MoodValue, target: HTMLButtonElement) => {
    setSelected(m)
    gsap.fromTo(target, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" })
    const q = moodQuotes[m][lang === "da" ? "da" : "en"][0]
    setMoodInsight({ mood: m, quote: q })
    requestAnimationFrame(() => {
      if (revealRef.current) {
        gsap.fromTo(revealRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" })
      }
    })
  }

  const save = () => {
    if (!selected) return
    addMoodEntry(selected, feeling.trim())
    setFeeling("")
    setSelected(null)
  }

  const quote = selected ? moodQuotes[selected][lang === "da" ? "da" : "en"][0] : null
  const activity = selected ? moodActivities[selected][lang === "da" ? "da" : "en"][0] : null

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const key = date.toISOString().slice(0, 10)
    const entry = moodEntries.find((e) => e.date === key)
    return { date, entry }
  })

  const mid = (moods.length - 1) / 2

  return (
    <div className="w-full min-h-full bg-paper">
      <div className="px-12 pt-16 pb-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber bg-amber-soft px-3.5 py-1.5 rounded-full mb-6">
          {t.mood.thisWeek}
        </div>
        <h1 className="font-serif text-[40px] lg:text-[50px] font-medium text-ink leading-[1.08] mb-4">{t.mood.title}</h1>
        <p className="text-[14.5px] text-ink-soft max-w-[460px] mb-16">{t.mood.writeFeelings}</p>

        <div ref={cardsRef} className="relative flex justify-center items-end mb-6" style={{ paddingBottom: 12 }}>
          {moods.map((m, i) => {
            const offset = i - mid
            const isSelected = selected === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={(e) => pick(m.value, e.currentTarget)}
                style={{
                  transform: `rotate(${isSelected ? 0 : offset * 7}deg) translateY(${isSelected ? -26 : Math.abs(offset) * 16}px)`,
                  zIndex: isSelected ? 50 : 10 - Math.abs(offset),
                  marginLeft: i === 0 ? 0 : -38,
                }}
                className={clsx(
                  "no-drag relative w-[180px] h-[250px] lg:w-[200px] lg:h-[276px] rounded-[28px] p-5 flex flex-col text-left text-white transition-all duration-300 ease-out hover:-translate-y-3 hover:z-50",
                  cardStyle[m.value],
                  cardShadow
                )}
              >
                <div className="text-[18px] font-bold leading-none">{t.mood[m.value]}</div>
                <div className="flex-1 grid place-items-center">
                  <MoodIcon mood={m.value} size={68} className="text-white" />
                </div>
              </button>
            )
          })}
        </div>

        {selected && (
          <div ref={revealRef} className="w-full max-w-[600px] mt-4">
            <div className="rounded-2xl bg-paper-raised border border-line p-6 mb-5 text-left">
              <p className="font-serif text-[17px] text-ink leading-relaxed">{quote}</p>
              {isLow && activity && (
                <div className="mt-3 text-[13px] text-ink-soft">
                  <span className="font-medium text-ink">{t.mood.activitySuggestion}: </span>
                  {activity}
                </div>
              )}
            </div>

            <div className="text-[13px] font-medium text-ink mb-2 text-left">{t.mood.writeFeelings}</div>
            <textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              rows={4}
              placeholder={t.mood.writeFeelings + "…"}
              className="w-full bg-paper-raised border border-line rounded-xl p-4 text-[14px] outline-none focus:border-ink/30 resize-none leading-relaxed"
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={save}
                className="no-drag bg-ink text-paper px-5 py-2.5 rounded-full text-[13px] font-medium hover:bg-amber transition-colors"
              >
                {t.gratitude.save}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="no-drag text-ink-soft px-4 py-2.5 rounded-full text-[13px] font-medium hover:text-ink"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-12 pb-16 flex flex-col items-center gap-12">
        <div className="w-full max-w-[640px] text-center">
          <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-5">{t.mood.thisWeek}</div>
          <div ref={weekRef} className="flex justify-between">
            {last7.map(({ date, entry }) => (
              <div key={date.toISOString()} className="flex flex-col items-center gap-2">
                <div
                  className={clsx(
                    "w-11 h-11 rounded-full grid place-items-center transition-transform duration-200 hover:scale-110",
                    entry ? "bg-amber-soft" : "border border-dashed border-line text-ink-soft/30"
                  )}
                >
                  {entry ? (
                    <MoodIcon mood={entry.mood} size={19} className={moods.find((m) => m.value === entry.mood)?.colorClass} />
                  ) : (
                    <span className="text-[12px]">·</span>
                  )}
                </div>
                <span className="text-[10.5px] text-ink-soft font-medium whitespace-nowrap">{lang === "da" ? weekdayFullDa(date) : format(date, "EEE")}</span>
              </div>
            ))}
          </div>
        </div>

        {moodEntries.length > 0 && (
          <div className="w-full max-w-[640px]">
            <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3 text-center">{t.mood.history}</div>
            <div ref={historyRef} className="space-y-1">
              {moodEntries.slice(0, 8).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3.5 px-2 py-2.5 rounded-lg hover:bg-black/[0.03] hover:scale-[1.01] transition-all"
                >
                  <MoodIcon mood={e.mood} size={19} className={clsx("shrink-0", moods.find((m) => m.value === e.mood)?.colorClass)} />
                  <div className="flex-1 min-w-0 flex items-baseline gap-2.5">
                    <span className="text-[11.5px] text-ink-soft shrink-0 w-[120px]">
                      {lang === "da" ? formatHistoryTimestampDa(e.createdAt) : format(e.createdAt, "EEE, MMM d · HH:mm")}
                    </span>
                    {e.note && <span className="text-[13px] text-ink truncate">{e.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
