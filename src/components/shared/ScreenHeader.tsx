import type { ReactNode } from "react"

export function ScreenHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-9">
      <div>
        <h1 className="font-serif text-[36px] font-medium text-ink">{title}</h1>
        {subtitle && <p className="text-[15px] text-ink-soft mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
