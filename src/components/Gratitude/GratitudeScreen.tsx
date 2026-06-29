import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import gsap from "gsap"
import clsx from "clsx"
import { HeartHandshake, Sparkle, Leaf, Flower2, Star, Trophy, Medal, Crown, Moon } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"

const decorations = [
  { Icon: Sparkle, className: "-top-3 -left-7 text-amber", float: { y: -8, rotate: -8 } },
  { Icon: Flower2, className: "-top-5 right-2 text-rose", float: { y: -10, rotate: 10 } },
  { Icon: Leaf, className: "-bottom-4 left-1/4 text-sage", float: { y: 8, rotate: -10 } },
  { Icon: Sparkle, className: "bottom-0 -right-6 text-blue", float: { y: 9, rotate: 8 } },
]

const rewardIconMap: Record<string, typeof Star> = {
  star: Star,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  dhikr: Moon,
}

const dhikrItems: { key: string; arabic: string; label: string; target: number }[] = [
  { key: "subhanallah", arabic: "سُبْحَانَ الله", label: "Subhanallah", target: 10 },
  { key: "alhamdulillah", arabic: "الْحَمْدُ لله", label: "Alhamdulillah", target: 10 },
  { key: "allahuakbar", arabic: "اللهُ أَكْبَر", label: "Allahu Akbar", target: 5 },
  { key: "lailahaillallah", arabic: "لا إله إلا الله", label: "La ilaha illallah", target: 5 },
]

export function GratitudeScreen() {
  const { t, lang } = useI18n()
  const rewardOptions: { key: string; icon: typeof Star; label: string }[] = [
    { key: "star", icon: Star, label: t.gratitude.rewardStar },
    { key: "trophy", icon: Trophy, label: t.gratitude.rewardTrophy },
    { key: "medal", icon: Medal, label: t.gratitude.rewardMedal },
    { key: "crown", icon: Crown, label: t.gratitude.rewardCrown },
  ]
  const [mode, setMode] = useState<"gratitude" | "thankGod">("gratitude")
  const [text, setText] = useState("")
  const [reward, setReward] = useState<string | null>(null)
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, number>>({})
  const entries = useAppStore((s) => s.gratitudeEntries)
  const addGratitudeEntry = useAppStore((s) => s.addGratitudeEntry)
  const composerRef = useRef<HTMLDivElement>(null)
  const decorRefs = useRef<(HTMLDivElement | null)[]>([])
  const letterRefs = useRef<HTMLSpanElement[]>([])
  letterRefs.current = []

  const isThankGod = mode === "thankGod"
  const headlineWord = isThankGod ? t.gratitude.thankGodTitle : t.gratitude.title

  const save = () => {
    if (!text.trim()) return
    const dhikrDone = dhikrItems.every((d) => (dhikrCounts[d.key] ?? 0) >= d.target)
    addGratitudeEntry(text.trim(), isThankGod ? (dhikrDone ? "dhikr" : undefined) : reward ?? undefined)
    setText("")
    setReward(null)
    setDhikrCounts({})
  }

  const pickReward = (key: string, el: HTMLButtonElement | null) => {
    setReward((r) => (r === key ? null : key))
    if (el) gsap.fromTo(el, { scale: 0.6, rotate: -15 }, { scale: 1, rotate: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" })
  }

  const tapDhikr = (key: string, target: number, el: HTMLButtonElement | null) => {
    setDhikrCounts((c) => {
      const next = Math.min((c[key] ?? 0) + 1, target)
      return { ...c, [key]: next }
    })
    if (el) gsap.fromTo(el, { scale: 0.85 }, { scale: 1, duration: 0.35, ease: "back.out(2)" })
  }

  useEffect(() => {
    if (letterRefs.current.length) {
      gsap.fromTo(
        letterRefs.current,
        { opacity: 0, y: 40, rotate: -6, scale: 0.6 },
        { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.6, stagger: 0.045, ease: "back.out(1.8)" }
      )
    }
    if (composerRef.current) {
      gsap.fromTo(composerRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: "power3.out" })
    }
  }, [mode])

  useEffect(() => {
    decorRefs.current.forEach((el, i) => {
      if (!el) return
      const d = decorations[i]
      gsap.to(el, {
        y: d.float.y,
        rotate: d.float.rotate,
        duration: 2 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2,
      })
    })
  }, [])

  return (
    <div className="w-full min-h-full px-12 pt-28 pb-16 flex flex-col items-center text-center">
      <div className="relative inline-block mb-3">
        {decorations.map((d, i) => {
          const Icon = d.Icon
          return (
            <div
              key={i}
              ref={(el) => {
                decorRefs.current[i] = el
              }}
              className={clsx("absolute pointer-events-none", d.className)}
            >
              <Icon size={26} className="opacity-70" />
            </div>
          )
        })}
        <h1 className="relative font-serif font-bold uppercase text-[58px] lg:text-[78px] leading-[0.95] tracking-tight text-ink">
          {headlineWord.split(" ").map((word, wi) =>
            lang === "da" ? (
              <span
                key={wi}
                ref={(el) => {
                  if (el) letterRefs.current.push(el)
                }}
                className="inline-block mr-5 lg:mr-7 last:mr-0"
              >
                {word}
              </span>
            ) : (
              <span key={wi} className="inline-block mr-5 lg:mr-7 last:mr-0">
                {word.split("").map((ch, ci) => (
                  <span
                    key={ci}
                    ref={(el) => {
                      if (el) letterRefs.current.push(el)
                    }}
                    className="inline-block"
                  >
                    {ch}
                  </span>
                ))}
              </span>
            )
          )}
        </h1>
      </div>

      <p className="text-[14.5px] text-ink-soft max-w-[440px] mb-10">
        {isThankGod ? t.gratitude.thankGodSubtitle : t.gratitude.subtitle}
      </p>

      <div className="flex gap-1.5 mb-7 bg-black/4 rounded-full p-1 w-fit">
        <button
          type="button"
          onClick={() => {
            setMode("gratitude")
            setDhikrCounts({})
          }}
          className={clsx("no-drag flex items-center gap-2 text-[13.5px] font-medium px-5 py-2 rounded-full transition-colors", !isThankGod ? "bg-paper-raised text-ink border border-line" : "text-ink-soft")}
        >
          <HeartHandshake size={15} />
          {t.gratitude.title}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("thankGod")
            setReward(null)
          }}
          className={clsx("no-drag flex items-center gap-2 text-[13.5px] font-medium px-5 py-2 rounded-full transition-colors", isThankGod ? "bg-paper-raised text-ink border border-line" : "text-ink-soft")}
        >
          <Sparkle size={15} />
          {t.gratitude.thankGodTitle}
        </button>
      </div>

      <div
        ref={composerRef}
        className={clsx(
          "w-full max-w-[640px] rounded-2xl border p-8 text-left mb-12",
          isThankGod ? "bg-sage/8 border-sage/20" : "bg-amber-soft/30 border-amber/20"
        )}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={isThankGod ? t.gratitude.thankGodPlaceholder : t.gratitude.placeholder}
          className="w-full bg-transparent outline-none text-[18px] font-serif text-ink resize-none leading-relaxed placeholder:text-ink-soft/50"
        />
        {isThankGod ? (
          <div className="mt-5 pt-5 border-t border-line/60">
            <div className="text-[12px] font-medium text-ink-soft mb-3">{t.gratitude.dhikrBeforeYouGo}</div>
            <div className="grid grid-cols-2 gap-2.5">
              {dhikrItems.map((d) => {
                const count = dhikrCounts[d.key] ?? 0
                const done = count >= d.target
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={(e) => tapDhikr(d.key, d.target, e.currentTarget)}
                    disabled={done}
                    className={clsx(
                      "no-drag flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 transition-colors text-left",
                      done ? "bg-sage/15 border-sage/30" : "border-line hover:border-sage/40"
                    )}
                  >
                    <div>
                      <div className="font-serif text-[15px] text-ink leading-none mb-1" dir="rtl">{d.arabic}</div>
                      <div className="text-[11px] text-ink-soft">{d.label}</div>
                    </div>
                    <div className={clsx("text-[12px] font-semibold tabular-nums shrink-0", done ? "text-sage" : "text-ink-soft")}>
                      {count}/{d.target}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 pt-5 border-t border-line/60">
            <div className="text-[12px] font-medium text-ink-soft mb-2.5">{t.gratitude.giveYourselfSomething}</div>
            <div className="flex items-center gap-2">
              {rewardOptions.map((opt) => {
                const Icon = opt.icon
                const active = reward === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.label}
                    onClick={(e) => pickReward(opt.key, e.currentTarget)}
                    className={clsx(
                      "no-drag w-10 h-10 rounded-full grid place-items-center border transition-colors",
                      active ? "bg-amber text-white border-amber" : "border-line text-ink-soft hover:border-ink/30 hover:text-ink"
                    )}
                  >
                    <Icon size={17} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={save}
          className="no-drag mt-5 bg-ink text-paper px-6 py-3 rounded-full text-[14px] font-medium hover:bg-amber transition-colors"
        >
          {t.gratitude.save}
        </button>
      </div>

      <div className="w-full max-w-[640px]">
        <div className="text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide mb-4">{t.gratitude.history}</div>
        {entries.length === 0 ? (
          <div className="text-[13.5px] text-ink-soft rounded-2xl border border-dashed border-line p-8 text-center">
            {t.gratitude.history}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto scrollbar-thin pr-1 text-left">
            {entries.map((e) => {
              const RewardIcon = e.reward ? rewardIconMap[e.reward] : null
              return (
                <div key={e.id} className="flex items-start gap-3 rounded-xl border border-line/70 bg-paper-raised px-5 py-4 hover:border-ink/15 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-ink-soft mb-1.5">{format(e.createdAt, "EEE, MMM d · HH:mm")}</div>
                    <div className="text-[14.5px] text-ink leading-relaxed">{e.text}</div>
                  </div>
                  {RewardIcon && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-amber-soft text-amber grid place-items-center">
                      <RewardIcon size={15} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
