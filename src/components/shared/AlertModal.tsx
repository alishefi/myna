import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Info } from "lucide-react"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"

export function AlertModal() {
  const { t } = useI18n()
  const alertMessage = useUiStore((s) => s.alertMessage)
  const hideAlert = useUiStore((s) => s.hideAlert)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (alertMessage && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "back.out(1.5)" }
      )
    }
  }, [alertMessage])

  if (!alertMessage) return null

  return (
    <div className="fixed inset-0 z-[68] bg-black/40 flex items-center justify-center p-6" onClick={hideAlert}>
      <div
        ref={modalRef}
        className="no-drag w-full max-w-[380px] bg-paper-raised rounded-2xl border border-line shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-blue/15 text-blue grid place-items-center">
            <Info size={22} />
          </div>
        </div>
        <h2 className="font-serif text-[17px] font-medium text-ink mb-1.5 text-center">{alertMessage.title ?? t.appName}</h2>
        <p className="text-[13.5px] text-ink-soft leading-relaxed mb-5 text-center">{alertMessage.message}</p>
        <button
          type="button"
          onClick={hideAlert}
          autoFocus
          className="no-drag w-full py-2.5 rounded-lg text-[13.5px] font-medium text-white bg-blue hover:opacity-90"
        >
          {t.common.ok}
        </button>
      </div>
    </div>
  )
}
