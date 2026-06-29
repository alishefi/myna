import { useEffect, useState } from "react"
import { Download, Sparkles, X } from "lucide-react"
import { useI18n } from "../../i18n"

type UpdateInfo = { available: boolean; version?: string; url?: string }

export function UpdateBanner() {
  const { t } = useI18n()
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Give the app a moment to settle before the network check.
    const id = setTimeout(async () => {
      try {
        const res = await window.myna?.updates.check()
        if (!cancelled && res?.available) setInfo(res)
      } catch {
        /* ignore — offline or repo unreachable */
      }
    }, 3000)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [])

  if (!info?.available || dismissed) return null

  return (
    <div className="print:hidden fixed bottom-5 end-5 z-[60] w-[320px] max-w-[calc(100vw-2.5rem)] animate-[fadeIn_0.25s_ease-out]">
      <div className="rounded-2xl border border-line bg-paper-raised shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-soft grid place-items-center">
            <Sparkles size={18} className="text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-ink">{t.update.available}</div>
            <p className="text-[12.5px] text-ink-soft leading-relaxed mt-0.5">
              {t.update.ready.replace("{v}", info.version ?? "")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            title={t.update.dismiss}
            className="no-drag shrink-0 text-ink-soft/60 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => info.url && window.myna?.updates.open(info.url)}
          className="no-drag mt-3 w-full flex items-center justify-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
        >
          <Download size={15} />
          {t.update.download}
        </button>
      </div>
    </div>
  )
}
