import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import clsx from "clsx"
import { X, Coffee, Camera, Keyboard, Sparkles, Heart } from "lucide-react"
import { useI18n } from "../../i18n"
import { AnimatedLogo } from "./AnimatedLogo"

export type HelpModalKind = "about" | "shortcuts" | "support"

const INSTAGRAM_URL = "https://instagram.com/_alishefi_"
const COFFEE_URL = "https://buymeacoffee.com/alishefi"

export function HelpModal({ kind, onClose }: { kind: HelpModalKind | null; onClose: () => void }) {
  const { t } = useI18n()
  const modalRef = useRef<HTMLDivElement>(null)
  const [version, setVersion] = useState<string | null>(null)

  const shortcuts: { action: string; keys: string }[] = [
    { action: t.help.scBold, keys: "Ctrl+B" },
    { action: t.help.scItalic, keys: "Ctrl+I" },
    { action: t.help.scUnderline, keys: "Ctrl+U" },
    { action: t.help.scUndo, keys: "Ctrl+Z" },
    { action: t.help.scRedo, keys: "Ctrl+Y" },
    { action: t.help.scNewNote, keys: "Ctrl+N" },
    { action: t.help.scPrint, keys: "Ctrl+P" },
    { action: t.help.scToggleSidebar, keys: "Ctrl+\\" },
    { action: t.help.scZoom, keys: "Ctrl+= / Ctrl+-" },
  ]

  const highlights = [t.help.highlight1, t.help.highlight2, t.help.highlight3]

  useEffect(() => {
    if (kind === "about") {
      window.myna?.app.version().then(setVersion)
    }
  }, [kind])

  useEffect(() => {
    if (kind && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "back.out(1.5)" }
      )
    }
  }, [kind])

  if (!kind) return null

  return (
    <div className="fixed inset-0 z-[65] bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        ref={modalRef}
        className="no-drag relative w-full max-w-[420px] bg-paper-raised rounded-[20px] border border-line shadow-2xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          title={t.common.close}
          onClick={onClose}
          className="no-drag absolute top-5 right-5 w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 text-ink-soft/70 hover:text-ink"
        >
          <X size={16} />
        </button>

        {kind === "about" && (
          <>
            <div className="flex justify-center mb-4">
              <AnimatedLogo size={56} />
            </div>
            <h2 className="font-serif text-[22px] font-medium text-ink mb-1 text-center">{t.appName}</h2>
            <p className="text-[12px] text-ink-soft text-center mb-4">
              {version ? `${t.help.version} ${version}` : "..."}
            </p>
            <p className="text-[14px] text-ink leading-relaxed text-center mb-5">{t.help.aboutTagline}</p>
            <div className="flex flex-col gap-2 bg-paper rounded-xl border border-line/70 p-4 mb-5">
              {highlights.map((h) => (
                <div key={h} className="flex items-start gap-2 text-[13px] text-ink-soft leading-snug">
                  <Sparkles size={13} className="text-amber mt-0.5 shrink-0" />
                  {h}
                </div>
              ))}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[12px] text-ink-soft/70">
              {t.help.madeWith} <Heart size={12} className="text-rose fill-rose" /> {t.help.madeWithSuffix}
            </p>
          </>
        )}

        {kind === "shortcuts" && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-full bg-blue/15 text-blue grid place-items-center shrink-0">
                <Keyboard size={16} />
              </span>
              <div className="font-serif text-[18px] text-ink">{t.help.shortcutsTitle}</div>
            </div>
            <div className="flex flex-col gap-1">
              {shortcuts.map((s) => (
                <div
                  key={s.action}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg odd:bg-paper"
                >
                  <span className="text-[13.5px] text-ink">{s.action}</span>
                  <span className="text-[12px] text-ink-soft bg-black/5 px-2 py-1 rounded-md font-mono shrink-0">
                    {s.keys}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {kind === "support" && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-full bg-amber-soft text-amber grid place-items-center shrink-0">
                <Heart size={16} />
              </span>
              <div className="font-serif text-[18px] text-ink">{t.help.supportTitle}</div>
            </div>
            <p className="text-[13.5px] text-ink-soft leading-relaxed mb-5">{t.help.supportText}</p>
            <div className="flex flex-col gap-2.5">
              <a
                href={COFFEE_URL || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => !COFFEE_URL && e.preventDefault()}
                className={clsx(
                  "no-drag flex items-center gap-3 rounded-xl px-4 py-3.5 bg-amber-soft text-amber font-semibold text-[14px] hover:brightness-95 transition",
                  !COFFEE_URL && "opacity-50 cursor-default pointer-events-none"
                )}
              >
                <Coffee size={18} />
                {t.help.buyCoffee}
              </a>
              <a
                href={INSTAGRAM_URL || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => !INSTAGRAM_URL && e.preventDefault()}
                className={clsx(
                  "no-drag flex items-center gap-3 rounded-xl px-4 py-3.5 bg-rose/15 text-rose font-semibold text-[14px] hover:brightness-95 transition",
                  !INSTAGRAM_URL && "opacity-50 cursor-default pointer-events-none"
                )}
              >
                <Camera size={18} />
                {t.help.followInstagram}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
