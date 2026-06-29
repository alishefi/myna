import { useState } from "react"
import clsx from "clsx"
import { BookOpen, Calendar, FileText, HeartHandshake, Mail, MessageCircle, MessageSquare, Moon, Sun } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { Logo } from "../shared/Logo"

const slideOrder = ["notes", "calendar", "books", "mood", "letters", "threads", "dialogue"] as const
const slideIcons: Record<(typeof slideOrder)[number], typeof FileText> = {
  notes: FileText,
  calendar: Calendar,
  books: BookOpen,
  mood: HeartHandshake,
  letters: Mail,
  threads: MessageCircle,
  dialogue: MessageSquare,
}
const slideAccents: Record<(typeof slideOrder)[number], { soft: string; text: string }> = {
  notes: { soft: "bg-amber-soft", text: "text-amber" },
  calendar: { soft: "bg-blue-soft", text: "text-blue" },
  books: { soft: "bg-sage-soft", text: "text-sage" },
  mood: { soft: "bg-rose-soft", text: "text-rose" },
  letters: { soft: "bg-amber-soft", text: "text-amber" },
  threads: { soft: "bg-blue-soft", text: "text-blue" },
  dialogue: { soft: "bg-sage-soft", text: "text-sage" },
}

const TOTAL_STEPS = slideOrder.length + 2 // intro + slides + finish

export function OnboardingScreen() {
  const { t, lang } = useI18n()
  const userName = useAppStore((s) => s.settings.userName)
  const theme = useAppStore((s) => s.settings.theme)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [step, setStep] = useState(0)

  const finish = () => updateSettings({ hasOnboarded: true })

  const isIntro = step === 0
  const isFinish = step === TOTAL_STEPS - 1
  const slideIndex = step - 1
  const slideKey = !isIntro && !isFinish ? slideOrder[slideIndex] : null

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto scrollbar-thin">
      <div className="w-full max-w-[620px] flex flex-col items-center text-center">
        <div className="mb-7">
          <Logo size={40} withName={false} />
        </div>

        {isIntro && (
          <>
            <h1 className="font-serif text-[46px] leading-[1.05] font-semibold text-ink tracking-tight mb-3">
              {t.onboarding.welcomeTitle}
            </h1>
            <p className="text-[19px] text-ink-soft mb-10">{t.onboarding.welcomeSubtitle}</p>

            <div className="w-full mb-6">
              <div className="text-[13px] font-semibold uppercase tracking-wider text-ink-soft/60 mb-3 text-start">
                {t.onboarding.languageLabel}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateSettings({ lang: "en" })}
                  className={clsx(
                    "no-drag rounded-2xl border px-5 py-4 text-[17px] font-medium transition-colors",
                    lang === "en" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink/30"
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ lang: "da" })}
                  className={clsx(
                    "no-drag rounded-2xl border px-5 py-4 text-[17px] font-medium transition-colors",
                    lang === "da" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink/30"
                  )}
                >
                  دری
                </button>
              </div>
            </div>

            <div className="w-full mb-6">
              <div className="text-[13px] font-semibold uppercase tracking-wider text-ink-soft/60 mb-3 text-start">
                {t.onboarding.themeLabel}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: "light" })}
                  className={clsx(
                    "no-drag flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-4 text-[17px] font-medium transition-colors",
                    theme === "light" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink/30"
                  )}
                >
                  <Sun size={19} />
                  {t.settings.themeLight}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: "dark" })}
                  className={clsx(
                    "no-drag flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-4 text-[17px] font-medium transition-colors",
                    theme === "dark" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink/30"
                  )}
                >
                  <Moon size={19} />
                  {t.settings.themeDark}
                </button>
              </div>
            </div>

            <div className="w-full mb-8">
              <div className="text-[13px] font-semibold uppercase tracking-wider text-ink-soft/60 mb-3 text-start">
                {t.onboarding.nameLabel}
              </div>
              <input
                value={userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                placeholder={t.onboarding.namePlaceholder}
                dir="auto"
                autoFocus
                className="no-drag w-full bg-paper-raised border border-line rounded-2xl px-5 py-4 text-[18px] outline-none focus:border-ink/30"
              />
            </div>

            <button
              type="button"
              disabled={!userName.trim()}
              onClick={() => setStep(1)}
              className="no-drag w-full bg-ink text-paper px-6 py-4 rounded-full text-[17px] font-medium disabled:opacity-30 hover:bg-amber transition-colors"
            >
              {t.onboarding.continue}
            </button>
          </>
        )}

        {slideKey && (
          <>
            <div className="absolute top-7 end-7">
              <button type="button" onClick={finish} className="no-drag text-[14px] font-medium text-ink-soft/60 hover:text-ink">
                {t.onboarding.skip}
              </button>
            </div>

            {(() => {
              const Icon = slideIcons[slideKey]
              const accent = slideAccents[slideKey]
              return (
                <div className={clsx("w-24 h-24 rounded-3xl grid place-items-center mb-8", accent.soft)}>
                  <Icon size={40} className={accent.text} />
                </div>
              )
            })()}

            <h2 className="font-serif text-[42px] leading-[1.08] font-semibold text-ink tracking-tight mb-4">
              {t.onboarding.slides[slideKey].title}
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed mb-9 max-w-[520px]">
              {t.onboarding.slides[slideKey].desc}
            </p>

            <div className="flex items-center gap-2 mb-9">
              {slideOrder.map((key, i) => (
                <span
                  key={key}
                  className={clsx("h-2 rounded-full transition-all", i === slideIndex ? "w-8 bg-ink" : "w-2 bg-line")}
                />
              ))}
            </div>

            <div className="w-full max-w-[440px] flex items-center gap-3">
              {slideIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="no-drag flex-1 border border-line text-ink-soft px-6 py-4 rounded-full text-[16px] font-medium hover:border-ink/30 hover:text-ink transition-colors"
                >
                  {t.onboarding.back}
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="no-drag flex-1 bg-ink text-paper px-6 py-4 rounded-full text-[16px] font-medium hover:bg-amber transition-colors"
              >
                {t.onboarding.next}
              </button>
            </div>
          </>
        )}

        {isFinish && (
          <>
            <h2 className="font-serif text-[46px] leading-[1.05] font-semibold text-ink tracking-tight mb-4">{t.onboarding.finishTitle}</h2>
            <p className="text-[20px] text-ink-soft mb-10">{t.onboarding.finishSubtitle}</p>
            <button
              type="button"
              onClick={finish}
              className="no-drag w-full max-w-[440px] bg-ink text-paper px-6 py-4 rounded-full text-[17px] font-medium hover:bg-amber transition-colors"
            >
              {t.onboarding.finishCta}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
