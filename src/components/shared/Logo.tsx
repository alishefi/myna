import logo from "../../assets/myna-logo.svg"
import { useI18n } from "../../i18n"

export function Logo({ size = 26, withName = true }: { size?: number; withName?: boolean }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <img src={logo} width={size} height={size} alt="Myna" draggable={false} />
      {withName && (
        <span className="font-serif text-[17px] tracking-tight text-ink select-none">{t.appName}</span>
      )}
    </div>
  )
}
