import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import clsx from "clsx"
import { ArrowRight, Lightbulb, Smile, HeartHandshake, Mail, Timer, MessageSquare, GraduationCap, BookOpen } from "lucide-react"
import { useUiStore } from "../../store/uiStore"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { promptLibrary } from "../../lib/quotes"
import type { ModuleKey, MoodValue } from "../../types"
import { AnimatedLogo } from "./AnimatedLogo"

const SLIDE_SECONDS = 15

const cardPalette = [
  { bg: "from-amber-soft via-amber/15 to-paper-raised", glow: "bg-amber/30", icon: "text-amber" },
  { bg: "from-blue/25 via-blue/8 to-paper-raised", glow: "bg-blue/30", icon: "text-blue" },
  { bg: "from-sage/25 via-sage/8 to-paper-raised", glow: "bg-sage/30", icon: "text-sage" },
  { bg: "from-rose/25 via-rose/8 to-paper-raised", glow: "bg-rose/30", icon: "text-rose" },
  { bg: "from-amber/20 via-rose/12 to-paper-raised", glow: "bg-amber/25", icon: "text-ink" },
  { bg: "from-blue/20 via-sage/12 to-paper-raised", glow: "bg-blue/25", icon: "text-ink" },
]

const moodPaletteIndex: Record<MoodValue, number> = { great: 0, good: 2, okay: 1, low: 1, rough: 3 }

export function SidebarSlider() {
  const { t, lang } = useI18n()
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  const moodInsight = useUiStore((s) => s.moodInsight)

  const [promptPick, setPromptPick] = useState(() => promptLibrary[Math.floor(Math.random() * promptLibrary.length)])

  useEffect(() => {
    const id = setInterval(() => {
      setPromptPick((prev) => {
        const pool = promptLibrary.filter((p) => p.en !== prev.en)
        return pool[Math.floor(Math.random() * pool.length)]
      })
    }, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const startPrompt = () => {
    const text = lang === "da" ? promptPick.da : promptPick.en
    const content = JSON.stringify({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] },
        { type: "paragraph" },
      ],
    })
    const note = useAppStore.getState().createNote({ content, tags: ["daily-prompt"], title: text })
    useUiStore.getState().openEditor(note.id)
  }

  const startLetter = () => {
    const letter = useAppStore.getState().createLetter("pastSelf")
    useUiStore.getState().setPendingLetterId(letter.id)
    setActiveModule("letters")
  }

  const startBook = () => {
    const project = useAppStore.getState().createBookProject()
    const chapter = useAppStore.getState().createBookChapter(project.id)
    useUiStore.getState().openBookProject(project.id)
    useUiStore.getState().openBookChapter(chapter.id)
  }

  const baseSlides = [
    { key: "prompts" as ModuleKey, icon: Lightbulb, title: t.home.promptOfDay, subtitle: lang === "da" ? promptPick.da : promptPick.en, cta: t.home.startWriting, action: startPrompt, insight: false },
    { key: "books" as ModuleKey, icon: BookOpen, title: t.home.writeABook, subtitle: t.home.writeABookSub, cta: t.home.startWriting, action: startBook, insight: false },
    { key: "mood" as ModuleKey, icon: Smile, title: t.home.moodCheckIn, subtitle: t.home.moodCheckInSub, cta: t.home.checkInNow, action: () => setActiveModule("mood"), insight: false },
    { key: "gratitude" as ModuleKey, icon: HeartHandshake, title: t.home.gratitudeQuick, subtitle: t.home.gratitudeQuickSub, cta: t.home.writeOne, action: () => setActiveModule("gratitude"), insight: false },
    { key: "letters" as ModuleKey, icon: Mail, title: t.home.unsentLetters, subtitle: t.home.unsentLettersSub, cta: t.home.writeALetter, action: startLetter, insight: false },
    { key: "stream" as ModuleKey, icon: Timer, title: t.home.streamWriting, subtitle: t.home.streamWritingSub, cta: t.home.startASession, action: () => setActiveModule("stream"), insight: false },
    { key: "dialogue" as ModuleKey, icon: MessageSquare, title: t.home.dialogueWriting, subtitle: t.home.dialogueWritingSub, cta: t.home.startAConversation, action: () => setActiveModule("dialogue"), insight: false },
    { key: "school" as ModuleKey, icon: GraduationCap, title: t.nav.school, subtitle: t.home.schoolSub, cta: t.home.openSchool, action: () => setActiveModule("school"), insight: false },
  ]

  const slides = moodInsight
    ? [
        {
          key: "mood" as ModuleKey,
          icon: Smile,
          title: t.mood[moodInsight.mood],
          subtitle: moodInsight.quote,
          cta: t.home.checkInAgain,
          action: () => setActiveModule("mood"),
          insight: true,
        },
        ...baseSlides,
      ]
    : baseSlides

  const [index, setIndex] = useState(0)
  const [colorIdx, setColorIdx] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const logoPopRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  indexRef.current = index

  const advance = () => {
    if (!contentRef.current) return
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -12,
      scale: 0.97,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        const next = (indexRef.current + 1) % slides.length
        setIndex(next)
        setColorIdx((c) => {
          let r = Math.floor(Math.random() * cardPalette.length)
          if (r === c) r = (r + 1) % cardPalette.length
          return r
        })
      },
    })
  }

  useEffect(() => {
    const id = setInterval(advance, SLIDE_SECONDS * 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length])

  useEffect(() => {
    if (!contentRef.current) return
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 12, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" }
    )
  }, [index])

  useEffect(() => {
    if (!barRef.current) return
    gsap.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: SLIDE_SECONDS, ease: "linear" })
  }, [index])

  useEffect(() => {
    if (!glowRef.current) return
    gsap.fromTo(glowRef.current, { opacity: 0.5, scale: 0.9 }, { opacity: 0.9, scale: 1.15, duration: 1.2, ease: "power2.out" })
  }, [colorIdx])

  useEffect(() => {
    if (!moodInsight) return
    setIndex(0)
    setColorIdx(moodPaletteIndex[moodInsight.mood])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodInsight])

  useEffect(() => {
    if (!logoPopRef.current) return
    gsap.fromTo(
      logoPopRef.current,
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "elastic.out(1, 0.55)" }
    )
  }, [])

  const goTo = (i: number) => {
    if (i === index) return
    if (!contentRef.current) return
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -12,
      scale: 0.97,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setIndex(i)
        setColorIdx((c) => {
          let r = Math.floor(Math.random() * cardPalette.length)
          if (r === c) r = (r + 1) % cardPalette.length
          return r
        })
      },
    })
  }

  const slide = slides[index]
  const Icon = slide.icon
  const palette = cardPalette[colorIdx]

  return (
    <div
      className={clsx(
        "no-drag relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br cursor-pointer mb-4 p-6 h-[268px] flex flex-col shadow-none transition-colors duration-700",
        palette.bg
      )}
      onClick={() => setActiveModule(slide.key)}
    >
      <div ref={glowRef} className={clsx("pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl", palette.glow)} />

      <div className="relative flex items-center gap-3 mb-5">
        <div ref={logoPopRef} className="shrink-0 -ml-2">
          <AnimatedLogo size={44} />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-ink leading-none">{slide.insight ? t.home.moodInsightLabel : t.home.mynaPicksLabel}</div>
          <div className="text-[11.5px] text-ink-soft/70 leading-none mt-1">{slide.insight ? t.home.justForCheckIn : t.home.forYouRightNow}</div>
        </div>
      </div>

      <div ref={contentRef} className="relative flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2.5 mb-2.5">
          <Icon size={19} className={clsx("shrink-0", palette.icon)} />
          <div className="text-[17px] font-semibold text-ink leading-snug line-clamp-2">{slide.title}</div>
        </div>
        <div className="text-[14px] text-ink-soft leading-snug line-clamp-3">{slide.subtitle}</div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            slide.action()
          }}
          className="no-drag mt-auto self-start inline-flex items-center gap-1.5 bg-ink text-paper px-4 py-2.5 rounded-full text-[12.5px] font-medium hover:bg-amber transition-colors"
        >
          {slide.cta}
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="relative flex items-center gap-1 mt-5 shrink-0">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goTo(i)
            }}
            className="no-drag h-1.5 rounded-full flex-1 bg-ink/10 overflow-hidden"
          >
            {i === index ? (
              <div ref={barRef} className="h-full bg-ink/55 origin-left rounded-full" style={{ transform: "scaleX(0)" }} />
            ) : i < index ? (
              <div className="h-full w-full bg-ink/30 rounded-full" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
