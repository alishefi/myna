import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Brain, Compass, Feather, Send, Smile, Sparkles, Trash2 } from "lucide-react"
import clsx from "clsx"
import gsap from "gsap"
import { format } from "date-fns"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import type { DialoguePreset } from "../../types"
import { makeId } from "../../lib/id"
import { getPresetInfo } from "../../lib/dialogueLibrary"
import { formatMonthDayYearDa } from "../../lib/dariDate"

const presets: DialoguePreset[] = ["anxiety", "futureSelf", "innerChild", "symbolic", "custom"]

const presetIcon: Record<DialoguePreset, typeof Brain> = {
  anxiety: Brain,
  futureSelf: Compass,
  innerChild: Smile,
  symbolic: Sparkles,
  custom: Feather,
}

const accentClasses: Record<string, { solid: string; front: string; shadow: string }> = {
  amber: { solid: "bg-amber text-white", front: "bg-amber-soft", shadow: "bg-amber" },
  blue: { solid: "bg-blue text-white", front: "bg-blue-soft", shadow: "bg-blue" },
  sage: { solid: "bg-sage text-white", front: "bg-sage-soft", shadow: "bg-sage" },
  rose: { solid: "bg-rose text-white", front: "bg-rose-soft", shadow: "bg-rose" },
}

const stackStyle = [
  { y: 0, scale: 1, rotate: 0, opacity: 1 },
  { y: 20, scale: 0.96, rotate: -3, opacity: 0.9 },
  { y: 36, scale: 0.92, rotate: 3, opacity: 0.72 },
  { y: 50, scale: 0.88, rotate: -2, opacity: 0.5 },
]

export function DialogueScreen() {
  const { t, lang } = useI18n()
  const dialogues = useAppStore((s) => s.dialogues)
  const settings = useAppStore((s) => s.settings)
  const createDialogue = useAppStore((s) => s.createDialogue)
  const deleteDialogue = useAppStore((s) => s.deleteDialogue)
  const [openId, setOpenId] = useState<string | null>(null)
  const [customLabel, setCustomLabel] = useState("")
  const [pendingCustom, setPendingCustom] = useState(false)
  const [stackOrder, setStackOrder] = useState<DialoguePreset[]>(presets)
  const frontRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef({ startX: 0, dragging: false, moved: false })
  const headlineRef = useRef<HTMLDivElement>(null)
  const stackWrapRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const open = dialogues.find((d) => d.id === openId)
  const front = stackOrder[0]
  const frontInfo = getPresetInfo(front)

  useEffect(() => {
    if (headlineRef.current) {
      gsap.fromTo(headlineRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
    }
    if (stackWrapRef.current) {
      gsap.fromTo(
        stackWrapRef.current,
        { opacity: 0, scale: 0.7, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.6)", delay: 0.15 }
      )
    }
    if (hintRef.current) {
      gsap.fromTo(hintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.55 })
    }
  }, [])

  const pick = (preset: DialoguePreset) => {
    if (preset === "custom") {
      setPendingCustom(true)
      return
    }
    const d = createDialogue(preset, t.dialogue.presets[preset])
    setOpenId(d.id)
  }

  const startCustom = () => {
    if (!customLabel.trim()) return
    const d = createDialogue("custom", customLabel.trim())
    setOpenId(d.id)
    setPendingCustom(false)
    setCustomLabel("")
  }

  const rotateStack = (direction: 1 | -1) => {
    setStackOrder((prev) => (direction === 1 ? [...prev.slice(1), prev[0]] : [prev[prev.length - 1], ...prev.slice(0, -1)]))
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, dragging: true, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging || !frontRef.current) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 4) dragRef.current.moved = true
    gsap.set(frontRef.current, { x: dx, rotate: dx / 18 })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    const dx = e.clientX - dragRef.current.startX
    const el = frontRef.current

    if (Math.abs(dx) > 90 && el) {
      const dir: 1 | -1 = dx < 0 ? 1 : -1
      gsap.to(el, {
        x: dir === 1 ? 520 : -520,
        rotate: dir === 1 ? 28 : -28,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          rotateStack(dir)
          gsap.set(el, { clearProps: "all" })
        },
      })
    } else if (!dragRef.current.moved) {
      pick(front)
      if (el) gsap.set(el, { clearProps: "all" })
    } else if (el) {
      gsap.to(el, { x: 0, rotate: 0, duration: 0.35, ease: "back.out(1.7)" })
    }
  }

  if (open) {
    return <DialogueConversation dialogueId={open.id} onBack={() => setOpenId(null)} />
  }

  return (
    <div className="px-12 pt-28 pb-16 w-full flex flex-col items-center">
      <div ref={headlineRef} className="text-center mb-12 max-w-[620px]">
        <div className="text-[14px] font-semibold text-ink-soft uppercase tracking-wide mb-3">{t.dialogue.title}</div>
        <div className="font-serif text-[42px] lg:text-[48px] font-medium text-ink leading-[1.1] mb-3">{t.dialogue.presets[front]}</div>
        <div className="text-[16px] text-ink-soft">{frontInfo.blurb[lang]}</div>
      </div>

      <div ref={stackWrapRef} className="relative w-[540px] h-[230px] mb-4 select-none">
        {stackOrder.slice(0, 4).map((preset, i) => {
          const Icon = presetIcon[preset]
          const info = getPresetInfo(preset)
          const accent = accentClasses[info.accent]
          const s = stackStyle[i]
          const isFront = i === 0
          return (
            <div
              key={preset}
              ref={isFront ? frontRef : undefined}
              onPointerDown={isFront ? onPointerDown : undefined}
              onPointerMove={isFront ? onPointerMove : undefined}
              onPointerUp={isFront ? onPointerUp : undefined}
              style={{
                transform: `translateY(${s.y}px) scale(${s.scale}) rotate(${s.rotate}deg)`,
                opacity: s.opacity,
                zIndex: 10 - i,
                pointerEvents: isFront ? "auto" : "none",
              }}
              className={clsx(
                "no-drag absolute inset-x-0 top-0 rounded-[40px] px-8 py-8 flex items-center gap-6",
                accent.front,
                isFront ? "cursor-grab active:cursor-grabbing shadow-xl" : "shadow-sm"
              )}
            >
              <div className={clsx("shrink-0 w-20 h-20 rounded-3xl bg-ink text-paper grid place-items-center")}>
                <Icon size={30} />
              </div>
              <div className="min-w-0">
                <div className="text-[19px] font-semibold text-[#1b1c1e] mb-1.5">{t.dialogue.presets[preset]}</div>
                <div className="text-[14px] text-[#1b1c1e]/70 leading-snug">{info.blurb[lang]}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div ref={hintRef} className="text-[13px] text-ink-soft mb-11">{t.dialogue.holdDragHint}</div>

      {pendingCustom && (
        <div className="flex gap-2 mb-12 max-w-[520px] w-full">
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startCustom()}
            placeholder={t.dialogue.otherLabelPlaceholder}
            autoFocus
            className="no-drag flex-1 bg-paper-raised border border-line rounded-full px-5 py-3 text-[15px] outline-none focus:border-ink/30"
          />
          <button
            type="button"
            onClick={startCustom}
            className="no-drag inline-flex items-center gap-1.5 bg-ink text-paper px-6 py-3 rounded-full text-[15px] font-medium"
          >
            {t.dialogue.customCta}
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {settings.dialogueHistory && dialogues.length > 0 && (
        <div className="w-full max-w-[920px]">
          <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-3">{t.dialogue.history}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
            {dialogues.map((d) => {
              const Icon = presetIcon[d.preset]
              const accent = accentClasses[getPresetInfo(d.preset).accent]
              return (
                <div
                  key={d.id}
                  className="no-drag group flex items-center gap-3.5 rounded-xl border border-line/70 bg-paper-raised px-5 py-4 cursor-pointer hover:border-ink/20"
                  onClick={() => setOpenId(d.id)}
                >
                  <div className={clsx("shrink-0 w-9 h-9 rounded-full grid place-items-center", accent.solid)}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-medium text-ink truncate">{d.otherLabel}</div>
                    <div className="text-[12px] text-ink-soft">
                      {lang === "da" ? formatMonthDayYearDa(d.updatedAt) : format(d.updatedAt, "MMM d, yyyy")} · {d.lines.length} {t.dialogue.linesCount}
                    </div>
                  </div>
                  <button
                    type="button"
                    title={t.editor.delete}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDialogue(d.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function DialogueConversation({ dialogueId, onBack }: { dialogueId: string; onBack: () => void }) {
  const { t, lang } = useI18n()
  const dialogue = useAppStore((s) => s.dialogues.find((d) => d.id === dialogueId))
  const updateDialogue = useAppStore((s) => s.updateDialogue)
  const [speaker, setSpeaker] = useState<"me" | "other">("me")
  const [text, setText] = useState("")

  const suggestions = useMemo(() => {
    if (!dialogue || speaker !== "other") return []
    const info = getPresetInfo(dialogue.preset)
    const pool = (dialogue.lines.length === 0 ? info.openers : info.replies).map((item) => item[lang])
    const picks: string[] = []
    const used = new Set<number>()
    while (picks.length < 3 && picks.length < pool.length) {
      const idx = Math.floor(Math.random() * pool.length)
      if (used.has(idx)) continue
      used.add(idx)
      picks.push(pool[idx])
    }
    return picks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue?.id, dialogue?.preset, speaker, dialogue?.lines.length, lang])

  if (!dialogue) return null

  const send = () => {
    if (!text.trim()) return
    updateDialogue(dialogue.id, {
      lines: [...dialogue.lines, { id: makeId(), speaker, text: text.trim() }],
    })
    setText("")
    setSpeaker(speaker === "me" ? "other" : "me")
  }

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex items-center gap-3 px-12 pt-8 pb-5 shrink-0">
        <button type="button" title={t.editor.back} onClick={onBack} className="no-drag text-ink-soft hover:text-ink">
          <ArrowLeft size={18} />
        </button>
        <div className="text-[16px] font-medium text-ink">
          {t.dialogue.me} — {dialogue.otherLabel}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-12 space-y-3.5">
        {dialogue.lines.map((line) => (
          <div key={line.id} className={clsx("flex", line.speaker === "me" ? "justify-end" : "justify-start")}>
            <div
              className={clsx(
                "max-w-[60%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed",
                line.speaker === "me" ? "bg-ink text-paper rounded-br-md" : "bg-blue-soft text-ink rounded-bl-md"
              )}
            >
              <div className="text-[11px] opacity-60 mb-1 font-medium uppercase tracking-wide">
                {line.speaker === "me" ? t.dialogue.me : dialogue.otherLabel}
              </div>
              {line.text}
            </div>
          </div>
        ))}
        {dialogue.lines.length === 0 && (
          <div className="text-center text-ink-soft text-[14px] py-12">{t.dialogue.placeholder}</div>
        )}
      </div>

      <div className="px-12 py-6 shrink-0">
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setSpeaker("me")}
            className={clsx("text-[13px] px-3.5 py-1.5 rounded-full", speaker === "me" ? "bg-ink text-paper" : "bg-black/5 text-ink-soft")}
          >
            {t.dialogue.me}
          </button>
          <button
            type="button"
            onClick={() => setSpeaker("other")}
            className={clsx("text-[13px] px-3.5 py-1.5 rounded-full", speaker === "other" ? "bg-blue text-white" : "bg-black/5 text-ink-soft")}
          >
            {dialogue.otherLabel}
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 max-w-[900px]">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(s)}
                className="no-drag text-left text-[12.5px] text-ink-soft bg-black/4 hover:bg-black/8 rounded-2xl px-3.5 py-2 leading-snug transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2.5 max-w-[900px]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t.dialogue.placeholder}
            className="flex-1 bg-paper-raised border border-line rounded-full px-5 py-3 text-[14.5px] outline-none focus:border-ink/30"
          />
          <button type="button" title={t.dialogue.addLine} onClick={send} className="no-drag w-11 h-11 shrink-0 grid place-items-center rounded-full bg-ink text-paper">
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
