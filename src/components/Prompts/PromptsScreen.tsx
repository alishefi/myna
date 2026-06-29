import { useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import clsx from "clsx"
import { ArrowRight, Clock, Shuffle, Sun, Heart, Briefcase, Sparkle, Compass } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { promptLibrary, type PromptCategory, type PromptItem } from "../../lib/quotes"
import { dialoguePromptCandidates } from "../../lib/dialogueLibrary"
import { findResurfacedNotes, findUnfinishedIdeas } from "../../lib/memoryEngine"
import { VisitedCard } from "../Home/VisitedCard"

const categoryDot: Record<PromptCategory, string> = {
  day: "bg-blue",
  personal: "bg-rose",
  work: "bg-sage",
  gratitude: "bg-amber",
  future: "bg-ink",
}

const categoryIcon: Record<PromptCategory, typeof Sun> = {
  day: Sun,
  personal: Heart,
  work: Briefcase,
  gratitude: Sparkle,
  future: Compass,
}

export function PromptsScreen() {
  const { t, lang } = useI18n()
  const categoryMeta: Record<PromptCategory, { label: string; dot: string; icon: typeof Sun }> = {
    day: { label: t.prompts.catDay, dot: categoryDot.day, icon: categoryIcon.day },
    personal: { label: t.prompts.catPersonal, dot: categoryDot.personal, icon: categoryIcon.personal },
    work: { label: t.prompts.catWork, dot: categoryDot.work, icon: categoryIcon.work },
    gratitude: { label: t.prompts.catGratitude, dot: categoryDot.gratitude, icon: categoryIcon.gratitude },
    future: { label: t.prompts.catFuture, dot: categoryDot.future, icon: categoryIcon.future },
  }
  const notes = useAppStore((s) => s.notes)
  const dialogues = useAppStore((s) => s.dialogues)
  const memoryInsights = useAppStore((s) => s.memoryInsights)
  const createNote = useAppStore((s) => s.createNote)
  const openEditor = useUiStore((s) => s.openEditor)

  const [spinning, setSpinning] = useState(false)
  const [revealed, setRevealed] = useState<PromptItem | null>(null)
  const highlightIdxRef = useRef(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const combinedLibrary = useMemo(() => {
    const extra = dialoguePromptCandidates(dialogues).slice(0, 3)

    const memoryPrompt: PromptItem[] = memoryInsights
      ? [{ en: memoryInsights.prompt, da: memoryInsights.prompt, category: "personal" }]
      : []

    const resurfaced: PromptItem[] = findResurfacedNotes(notes, 2).map((r) => ({
      en: `You wrote something similar before — what's changed since "${r.note.title || "that note"}"?`,
      da: `پیش از این چیزی مشابه نوشته بودید — از زمان «${r.note.title || "آن یادداشت"}» چه چیزی تغییر کرده؟`,
      category: "personal",
    }))

    const unfinished: PromptItem[] = findUnfinishedIdeas(notes, 2).map((n) => ({
      en: `Pick this idea back up: "${n.title || "an old idea"}"`,
      da: `این ایده را دوباره ادامه بده: «${n.title || "یک ایدهٔ قدیمی"}»`,
      category: "personal",
    }))

    return [...promptLibrary, ...extra, ...memoryPrompt, ...resurfaced, ...unfinished]
  }, [dialogues, memoryInsights, notes])

  const sampleItems = useMemo(() => combinedLibrary.filter((_, i) => i % 4 === 0).slice(0, 9), [combinedLibrary])

  const history = notes.filter((n) => n.tags.includes("daily-prompt"))

  const respond = (promptText: string) => {
    const content = JSON.stringify({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: promptText }] },
        { type: "paragraph" },
      ],
    })
    const note = createNote({ content, tags: ["daily-prompt"], title: promptText })
    openEditor(note.id)
  }

  const applyHighlight = (idx: number, duration: number) => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const dist = Math.abs(i - idx)
      gsap.to(el, {
        opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : 0.25,
        scale: dist === 0 ? 1.05 : dist === 1 ? 0.95 : 0.9,
        duration,
        ease: "power2.out",
        overwrite: "auto",
      })
    })
  }

  const spin = () => {
    if (spinning) return
    setSpinning(true)

    if (listRef.current) {
      gsap.to(listRef.current, {
        keyframes: {
          skewY: [0, -0.8, 0.8, -0.4, 0.4, 0],
          x: [0, -1.5, 1.5, -0.6, 0.6, 0],
        },
        duration: 1.3,
        ease: "sine.inOut",
      })
    }

    const ticks = 20
    let count = 0
    const runTick = (delay: number) => {
      gsap.delayedCall(delay, () => {
        count++
        const progress = count / ticks
        const tickDuration = 0.1 + progress * 0.18
        highlightIdxRef.current = (highlightIdxRef.current + 1) % sampleItems.length
        applyHighlight(highlightIdxRef.current, tickDuration)
        if (count < ticks) {
          runTick(0.04 + progress * progress * 0.22)
        } else {
          const pool = combinedLibrary.filter((p) => p.en !== revealed?.en)
          const final = pool[Math.floor(Math.random() * pool.length)]
          setRevealed(final)
          setSpinning(false)
          if (headingRef.current) {
            gsap.fromTo(
              headingRef.current,
              { opacity: 0, y: 14, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
            )
          }
        }
      })
    }
    runTick(0.03)
  }

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
    }
    const els = itemRefs.current.filter((el): el is HTMLDivElement => el !== null)
    gsap.set(els, { opacity: 0, y: 18, scale: 0.88 })
    gsap.to(els, {
      opacity: (i) => (i === highlightIdxRef.current ? 1 : Math.abs(i - highlightIdxRef.current) === 1 ? 0.5 : 0.25),
      y: 0,
      scale: (i) => (i === highlightIdxRef.current ? 1.05 : Math.abs(i - highlightIdxRef.current) === 1 ? 0.95 : 0.9),
      duration: 0.55,
      stagger: 0.05,
      ease: "back.out(1.5)",
      delay: 0.35,
    })
  }, [])

  return (
    <div className="w-full min-h-full">
      <div ref={heroRef} className="px-12 pt-[88px] pb-10 min-h-[78vh] flex flex-col items-center justify-center text-center max-w-[760px] mx-auto">
        {revealed ? (
          <div ref={headingRef}>
            <div className={clsx("inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-5 text-white", categoryMeta[revealed.category].dot)}>
              {categoryMeta[revealed.category].label}
            </div>
            <h1 className="font-serif text-[36px] lg:text-[42px] font-medium text-ink leading-[1.12] mb-8">
              {lang === "da" ? revealed.da : revealed.en}
            </h1>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => respond(lang === "da" ? revealed.da : revealed.en)}
                className="no-drag inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full text-[14px] font-medium hover:bg-amber transition-colors"
              >
                {t.prompts.startWriting}
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="no-drag inline-flex items-center gap-2 border border-line text-ink px-5 py-3 rounded-full text-[14px] font-medium hover:border-ink/30 transition-colors disabled:opacity-50"
              >
                <Shuffle size={15} />
                {t.prompts.getAnotherIdea}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-serif text-[44px] lg:text-[52px] font-medium text-ink leading-[1.05] mb-5">
              {t.prompts.heroTitleLine1}
              <br />
              {t.prompts.heroTitleLine2}
            </h1>
            <p className="text-[14.5px] text-ink-soft max-w-[420px] mx-auto mb-9 leading-relaxed">
              {t.prompts.heroSubtitle}
            </p>
            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              className="no-drag inline-flex items-center gap-2.5 bg-ink text-paper px-6 py-3.5 rounded-full text-[14.5px] font-medium hover:bg-amber transition-colors disabled:opacity-60"
            >
              <Shuffle size={16} />
              {t.prompts.getRandomIdea}
            </button>
          </div>
        )}

        <div className="relative h-[400px] w-full mt-4">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-paper to-transparent z-10" />
          <div ref={listRef} className="h-full flex flex-col items-center justify-center gap-3 overflow-hidden">
            {sampleItems.map((item, i) => {
              const meta = categoryMeta[item.category]
              const Icon = meta.icon
              return (
                <div
                  key={item.en}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="flex items-center gap-3.5 px-2"
                >
                  <div className={clsx("shrink-0 w-8 h-8 rounded-full grid place-items-center text-white", meta.dot)}>
                    <Icon size={14} />
                  </div>
                  <span className="text-[18px] lg:text-[20px] font-medium leading-snug text-ink">
                    {lang === "da" ? item.da : item.en}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-paper to-transparent z-10" />
        </div>
      </div>

      {history.length > 0 && (
        <div className="px-12 pb-14 max-w-[760px] mx-auto">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
            <Clock size={12} />
            {t.prompts.history}
          </div>
          <div className="flex flex-col gap-2.5">
            {history.map((n) => (
              <VisitedCard key={n.id} note={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
