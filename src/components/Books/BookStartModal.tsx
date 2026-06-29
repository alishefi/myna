import { useState } from "react"
import clsx from "clsx"
import { BookOpen, Feather, X } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { stylePresetLabels } from "../../lib/bookBlueprint"
import type { BookStylePreset } from "../../types"

const presets: BookStylePreset[] = ["novel", "nonfiction", "poetry", "academic"]

export function BookStartModal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n()
  const createBookProject = useAppStore((s) => s.createBookProject)
  const createManuscriptBlueprint = useAppStore((s) => s.createManuscriptBlueprint)
  const openBookProject = useUiStore((s) => s.openBookProject)
  const presetLabels = stylePresetLabels(lang)

  const [step, setStep] = useState<"choose" | "blueprint">("choose")
  const [title, setTitle] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [stylePreset, setStylePreset] = useState<BookStylePreset>("novel")

  const startBlank = () => {
    const project = createBookProject(title)
    openBookProject(project.id)
    onClose()
  }

  const startBlueprint = () => {
    const project = createManuscriptBlueprint(title, authorName, stylePreset, lang)
    openBookProject(project.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="no-drag w-full max-w-[620px] bg-paper-raised rounded-2xl border border-line shadow-xl p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} title={t.common.close} className="no-drag absolute top-4 right-4 text-ink-soft/60 hover:text-ink">
          <X size={17} />
        </button>

        {step === "choose" ? (
          <>
            <h2 className="font-serif text-[24px] font-medium text-ink mb-1.5">{t.books.modalChooseTitle}</h2>
            <p className="text-[13.5px] text-ink-soft mb-6">{t.books.modalChooseSubtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={startBlank}
                className="no-drag text-start rounded-xl border border-line/70 bg-paper p-5 hover:border-ink/25 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber/15 grid place-items-center mb-3">
                  <Feather size={18} className="text-amber" />
                </div>
                <div className="text-[15px] font-semibold text-ink mb-1">{t.books.ideationTitle}</div>
                <div className="text-[12.5px] text-ink-soft leading-relaxed">{t.books.ideationDescription}</div>
              </button>

              <button
                type="button"
                onClick={() => setStep("blueprint")}
                className="no-drag text-start rounded-xl border border-line/70 bg-paper p-5 hover:border-ink/25 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue/15 grid place-items-center mb-3">
                  <BookOpen size={18} className="text-blue" />
                </div>
                <div className="text-[15px] font-semibold text-ink mb-1">{t.books.blueprintTitle}</div>
                <div className="text-[12.5px] text-ink-soft leading-relaxed">{t.books.blueprintDescription}</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-serif text-[24px] font-medium text-ink mb-1.5">{t.books.blueprintFormTitle}</h2>
            <p className="text-[13.5px] text-ink-soft mb-6">{t.books.blueprintFormSubtitle}</p>

            <label className="block text-[12.5px] font-medium text-ink-soft mb-1.5">{t.books.bookTitleLabel}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.books.untitledBook}
              autoFocus
              className="no-drag w-full bg-paper border border-line rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-ink/30 mb-4"
            />

            <label className="block text-[12.5px] font-medium text-ink-soft mb-1.5">{t.books.authorNameLabel}</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t.books.authorNamePlaceholder}
              className="no-drag w-full bg-paper border border-line rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-ink/30 mb-4"
            />

            <label className="block text-[12.5px] font-medium text-ink-soft mb-2">{t.books.stylePresetLabel}</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setStylePreset(p)}
                  className={clsx(
                    "no-drag text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border transition-colors",
                    stylePreset === p ? "bg-ink text-paper border-ink" : "border-line text-ink-soft hover:border-ink/30"
                  )}
                >
                  {presetLabels[p]}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep("choose")} className="no-drag text-[13px] text-ink-soft hover:text-ink">
                {t.books.back}
              </button>
              <button
                type="button"
                onClick={startBlueprint}
                className="no-drag bg-ink text-paper px-5 py-2.5 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
              >
                {t.books.createManuscript}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
