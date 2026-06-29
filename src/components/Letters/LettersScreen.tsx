import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import gsap from "gsap"
import clsx from "clsx"
import { ArrowUpRight, Feather, Mail, Plus, Trash2, X } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import type { LetterRecipient } from "../../types"
import { useGsapEntrance } from "../../lib/useGsapEntrance"
import { pickLetterPrompt } from "../../lib/letterLibrary"
import { formatMonthDayYearDa } from "../../lib/dariDate"

const recipients: LetterRecipient[] = [
  "pastSelf",
  "futureSelf",
  "someoneIMiss",
  "someoneWhoHurtMe",
  "someoneILove",
  "closure",
]

const recipientAccent: Record<LetterRecipient, "amber" | "blue" | "sage" | "rose"> = {
  pastSelf: "amber",
  futureSelf: "blue",
  someoneIMiss: "rose",
  someoneWhoHurtMe: "sage",
  someoneILove: "rose",
  closure: "blue",
}

const accentClasses: Record<string, { solid: string; soft: string; text: string; ring: string }> = {
  amber: { solid: "bg-amber", soft: "bg-amber-soft", text: "text-amber", ring: "group-hover:border-amber/40" },
  blue: { solid: "bg-blue", soft: "bg-blue-soft", text: "text-blue", ring: "group-hover:border-blue/40" },
  sage: { solid: "bg-sage", soft: "bg-sage-soft", text: "text-sage", ring: "group-hover:border-sage/40" },
  rose: { solid: "bg-rose", soft: "bg-rose-soft", text: "text-rose", ring: "group-hover:border-rose/40" },
}

const CLOSED_W = 300
const CLOSED_H = 190

type Phase = "closed" | "opening" | "open" | "closing"

export function LettersScreen() {
  const { t, lang } = useI18n()
  const letters = useAppStore((s) => s.letters)
  const notes = useAppStore((s) => s.notes)
  const createLetter = useAppStore((s) => s.createLetter)
  const updateLetter = useAppStore((s) => s.updateLetter)
  const deleteLetter = useAppStore((s) => s.deleteLetter)
  const pendingLetterId = useUiStore((s) => s.pendingLetterId)
  const setPendingLetterId = useUiStore((s) => s.setPendingLetterId)

  const [openId, setOpenId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("closed")
  const [slotPrompts, setSlotPrompts] = useState<string[]>(() =>
    recipients.map((r) => pickLetterPrompt(r, t.letters.recipients[r], notes, lang))
  )
  const ref = useGsapEntrance()
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const floatTweensRef = useRef<(gsap.core.Tween | null)[]>([])
  const historyRefs = useRef<(HTMLDivElement | null)[]>([])
  const openSlotIdxRef = useRef<number | null>(null)

  const backdropRef = useRef<HTMLDivElement>(null)
  const flapRef = useRef<HTMLDivElement>(null)
  const envelopeBodyRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)

  const open = letters.find((l) => l.id === openId)
  const openAccent = open ? accentClasses[recipientAccent[open.recipient]] : accentClasses.amber

  useEffect(() => {
    if (pendingLetterId) {
      setOpenId(pendingLetterId)
      setPhase("opening")
      setPendingLetterId(null)
    }
    const cards = cardRefs.current.filter((el): el is HTMLButtonElement => el !== null)
    gsap.fromTo(
      cards,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out", delay: 0.1 }
    )
    const history = historyRefs.current.filter((el): el is HTMLDivElement => el !== null)
    if (history.length) {
      gsap.fromTo(
        history,
        { opacity: 0, y: 30, scale: 0.7, rotate: -6 },
        { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.6)", delay: 0.2 }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pickEnvelope = (i: number, r: LetterRecipient) => {
    const el = cardRefs.current[i]
    const prompt = slotPrompts[i]
    if (!el) {
      openNew(r, prompt)
      return
    }
    openSlotIdxRef.current = i
    floatTweensRef.current[i]?.kill()
    gsap.to(el, {
      scale: 0.94,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        openNew(r, prompt)
        gsap.set(el, { scale: 0.96, opacity: 0 })
        gsap.to(el, { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.45 })
      },
    })
  }

  useEffect(() => {
    if (phase !== "opening") return
    const flap = flapRef.current
    const paper = paperRef.current
    const body = envelopeBodyRef.current
    const backdrop = backdropRef.current
    if (!flap || !paper || !body || !backdrop) return

    const backdropBox = backdrop.getBoundingClientRect()
    const targetW = Math.min(1180, backdropBox.width * 0.96)
    const targetH = backdropBox.height * 0.9

    gsap.set(backdrop, { opacity: 0 })
    gsap.set(paper, { width: CLOSED_W, height: CLOSED_H, borderRadius: 18, opacity: 0, scale: 0.6, y: 50 })
    gsap.set(flap, { rotateX: 0 })

    const tl = gsap.timeline({ onComplete: () => setPhase("open") })
    tl.to(backdrop, { opacity: 1, duration: 0.25, ease: "power1.out" })
    tl.to(flap, { rotateX: -160, duration: 0.5, ease: "power2.inOut" }, 0.05)
    tl.to(paper, { opacity: 1, y: -14, scale: 1, duration: 0.45, ease: "back.out(1.5)" }, 0.25)
    tl.to(body, { opacity: 0, duration: 0.3 }, 0.55)
    tl.to(paper, { width: targetW, height: targetH, borderRadius: 26, y: 0, duration: 0.55, ease: "power3.inOut" }, 0.5)
  }, [phase])

  useEffect(() => {
    if (phase !== "closing") return
    const flap = flapRef.current
    const paper = paperRef.current
    const body = envelopeBodyRef.current
    const backdrop = backdropRef.current
    if (!flap || !paper || !body || !backdrop) return

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("closed")
        setOpenId(null)
        const idx = openSlotIdxRef.current
        if (idx !== null) {
          const r = recipients[idx]
          setSlotPrompts((prev) => {
            const next = [...prev]
            next[idx] = pickLetterPrompt(r, t.letters.recipients[r], notes, lang)
            return next
          })
          openSlotIdxRef.current = null
        }
      },
    })
    tl.to(paper, { width: CLOSED_W, height: CLOSED_H, borderRadius: 18, duration: 0.5, ease: "power3.inOut" })
    tl.to(body, { opacity: 1, duration: 0.25 }, "-=0.2")
    tl.to(paper, { opacity: 0, y: 50, scale: 0.6, duration: 0.35, ease: "power2.in" }, "-=0.1")
    tl.to(flap, { rotateX: 0, duration: 0.4, ease: "power2.inOut" }, "-=0.3")
    tl.to(backdrop, { opacity: 0, duration: 0.25 }, "-=0.15")
  }, [phase])

  const openNew = (r: LetterRecipient, prompt?: string) => {
    const l = createLetter(r)
    if (prompt) updateLetter(l.id, { title: prompt })
    setOpenId(l.id)
    setPhase("opening")
  }

  const openExisting = (id: string) => {
    openSlotIdxRef.current = null
    setOpenId(id)
    setPhase("opening")
  }

  const closeLetter = () => setPhase("closing")

  return (
    <div ref={ref} className="p-12 pt-16 w-full flex flex-col items-center">
      <div className="w-full max-w-[1040px] text-center mb-11">
        <div className="w-11 h-11 rounded-full bg-amber-soft grid place-items-center mx-auto mb-4">
          <Mail size={18} className="text-amber" />
        </div>
        <h1 className="font-serif text-[42px] font-medium text-ink tracking-tight leading-tight">{t.letters.title}</h1>
        <p className="text-[15px] text-ink-soft mt-2">{t.letters.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 w-full max-w-[1040px]">
        {recipients.map((r, i) => {
          const accent = accentClasses[recipientAccent[r]]
          return (
            <button
              key={r}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              type="button"
              onClick={() => pickEnvelope(i, r)}
              className={clsx(
                "no-drag group relative flex flex-col overflow-hidden rounded-[22px] border border-line/60 bg-paper-raised p-6 pt-7 text-start shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
                accent.ring
              )}
            >
              <div className={clsx("absolute inset-x-0 top-0 h-[5px]", accent.solid)} />

              <div className="flex items-center justify-between mb-5">
                <div className={clsx("w-10 h-10 rounded-full grid place-items-center", accent.soft)}>
                  <Feather size={16} className={accent.text} />
                </div>
                <Mail size={14} className="text-ink-soft/25 group-hover:text-ink-soft/50 transition-colors" />
              </div>

              <div className={clsx("font-serif text-[21px] font-semibold leading-snug mb-3", accent.text)}>
                {t.letters.recipients[r]}
              </div>
              <div className="text-[12.5px] text-ink-soft leading-relaxed mb-6 flex-1 border-t border-dashed border-line/60 pt-3">
                {slotPrompts[i]}
              </div>

              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft/60 group-hover:text-ink transition-colors">
                <span>{t.letters.new}</span>
                <ArrowUpRight size={13} className="rtl:-scale-x-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          )
        })}
      </div>

      <div className="w-full max-w-[1040px]">
        {letters.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-semibold text-ink-soft/60 uppercase tracking-wider">{t.letters.sealed}</span>
            <span className="flex-1 h-px bg-line/60" />
            <span className="text-[11px] font-medium text-ink-soft/50 tabular-nums">{letters.length}</span>
          </div>
        )}
        {letters.length === 0 ? (
          <div className="text-center py-16 text-ink-soft text-[14px] rounded-2xl border border-dashed border-line/70">{t.letters.empty}</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2.5">
            {letters.map((l, i) => {
              const accent = accentClasses[recipientAccent[l.recipient]]
              return (
                <div
                  key={l.id}
                  ref={(el) => {
                    historyRefs.current[i] = el
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => openExisting(l.id)}
                  onKeyDown={(e) => e.key === "Enter" && openExisting(l.id)}
                  title={lang === "da" ? formatMonthDayYearDa(l.updatedAt) : format(l.updatedAt, "MMM d, yyyy")}
                  className="no-drag group relative h-14 rounded-xl border border-line/60 grid place-items-center cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className={clsx("absolute inset-0 rounded-xl opacity-40", accent.soft)} />
                  <Mail size={13} className={clsx("relative", accent.text)} />
                  <button
                    type="button"
                    title={t.editor.delete}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLetter(l.id)
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full opacity-0 group-hover:opacity-100 bg-ink text-paper hover:bg-rose grid place-items-center transition-all"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => openNew("pastSelf")}
        className="no-drag fixed bottom-10 right-10 w-14 h-14 rounded-full bg-ink text-paper grid place-items-center hover:bg-amber transition-colors"
        title={t.letters.new}
      >
        <Plus size={20} />
      </button>

      {open && phase !== "closed" && (
        <div
          ref={backdropRef}
          className="fixed inset-x-0 bottom-0 top-10 z-50 bg-paper/75 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => {
            if (phase === "open" && e.target === backdropRef.current) closeLetter()
          }}
        >
          <div className="relative" style={{ perspective: 1200 }}>
            <div
              ref={envelopeBodyRef}
              className="absolute inset-0 m-auto rounded-2xl overflow-hidden"
              style={{ width: CLOSED_W, height: CLOSED_H, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              <div className={clsx("absolute inset-0", openAccent.soft)} />
              <div
                className={clsx("absolute inset-x-0 top-0 opacity-55", openAccent.solid)}
                style={{ height: "55%", clipPath: "polygon(0 0, 50% 100%, 0 100%)" }}
              />
              <div
                className={clsx("absolute inset-x-0 top-0 opacity-55", openAccent.solid)}
                style={{ height: "55%", clipPath: "polygon(100% 0, 100% 100%, 50% 100%)" }}
              />
              <div
                ref={flapRef}
                className={clsx("absolute inset-x-0 top-0", openAccent.solid)}
                style={{ height: "100%", clipPath: "polygon(0 0, 100% 0, 50% 58%)", transformOrigin: "top", transformStyle: "preserve-3d" }}
              >
                <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper-raised grid place-items-center shadow-sm">
                  <Feather size={15} className="text-ink/70" />
                </div>
              </div>
            </div>

            <div
              ref={paperRef}
              className="relative bg-paper-raised shadow-2xl overflow-hidden flex flex-col"
            >
              {phase === "open" ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className={clsx("h-1.5 shrink-0", openAccent.solid)} />
                  <div className="flex-1 flex flex-col p-10 overflow-y-auto scrollbar-thin">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx("w-7 h-7 rounded-full grid place-items-center text-white", openAccent.solid)}>
                          <Mail size={13} />
                        </div>
                        <div className="text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide">
                          {t.letters.recipients[open.recipient]}
                        </div>
                      </div>
                      <button type="button" title={t.editor.back} onClick={closeLetter} className="no-drag text-ink-soft hover:text-ink">
                        <X size={18} />
                      </button>
                    </div>
                    <input
                      value={open.title}
                      onChange={(e) => updateLetter(open.id, { title: e.target.value })}
                      placeholder={t.letters.placeholder}
                      autoFocus
                      className="w-full bg-transparent outline-none font-serif text-[36px] text-ink mb-6 placeholder:text-ink-soft/40"
                    />
                    <textarea
                      value={open.content}
                      onChange={(e) => updateLetter(open.id, { content: e.target.value })}
                      className="flex-1 w-full bg-transparent outline-none text-[23px] leading-[1.85] text-ink resize-none font-serif placeholder:text-ink-soft/40"
                      placeholder="…"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-[12px] font-medium text-ink-soft text-center leading-snug">
                    {open.title || t.letters.recipients[open.recipient]}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
