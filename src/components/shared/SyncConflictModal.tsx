import { AlertTriangle } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"

export function SyncConflictModal() {
  const { t } = useI18n()
  const syncConflict = useAppStore((s) => s.syncConflict)
  const keepMyVersion = useAppStore((s) => s.keepMyVersion)
  const useOtherVersion = useAppStore((s) => s.useOtherVersion)

  if (!syncConflict) return null

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-6">
      <div className="no-drag w-full max-w-[420px] bg-paper-raised rounded-2xl border border-line shadow-xl p-6">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-amber-soft text-amber grid place-items-center">
            <AlertTriangle size={22} />
          </div>
        </div>
        <h2 className="font-serif text-[18px] font-medium text-ink mb-1.5 text-center">{t.syncModal.title}</h2>
        <p className="text-[13px] text-ink-soft leading-relaxed mb-5 text-center">{t.syncModal.body}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={useOtherVersion}
            className="no-drag px-3.5 py-2 rounded-lg text-[13px] font-medium text-ink-soft hover:text-ink hover:bg-black/5"
          >
            {t.syncModal.useOther}
          </button>
          <button
            type="button"
            onClick={keepMyVersion}
            className="no-drag px-3.5 py-2 rounded-lg text-[13px] font-medium text-white bg-blue hover:opacity-90"
          >
            {t.syncModal.keepMine}
          </button>
        </div>
      </div>
    </div>
  )
}
