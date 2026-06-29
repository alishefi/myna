import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { AnimatedLogo } from "./AnimatedLogo"

export function LeaveConfirmModal() {
  const { t } = useI18n()
  const pendingModule = useUiStore((s) => s.pendingModule)
  const confirmModuleSwitch = useUiStore((s) => s.confirmModuleSwitch)
  const cancelModuleSwitch = useUiStore((s) => s.cancelModuleSwitch)

  if (!pendingModule) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6" onClick={cancelModuleSwitch}>
      <div
        className="no-drag w-full max-w-[400px] bg-paper-raised rounded-2xl border border-line shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <AnimatedLogo size={56} variant="confused" />
        </div>
        <h2 className="font-serif text-[18px] font-medium text-ink mb-1.5 text-center">{t.leaveModal.title}</h2>
        <p className="text-[13px] text-ink-soft leading-relaxed mb-5 text-center">{t.leaveModal.body}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={cancelModuleSwitch}
            className="no-drag px-3.5 py-2 rounded-lg text-[13px] font-medium text-ink-soft hover:text-ink hover:bg-black/5"
          >
            {t.leaveModal.stay}
          </button>
          <button
            type="button"
            onClick={() => confirmModuleSwitch(true)}
            className="no-drag px-3.5 py-2 rounded-lg text-[13px] font-medium text-white bg-blue hover:opacity-90"
          >
            {t.leaveModal.saveAndLeave}
          </button>
        </div>
      </div>
    </div>
  )
}
