import type { ComponentType } from "react"
import { useRef } from "react"
import gsap from "gsap"
import clsx from "clsx"

type Accent = "amber" | "blue" | "sage" | "rose"

const accentClasses: Record<Accent, { box: string; ghost: string; ring: string }> = {
  amber: { box: "bg-amber-soft text-amber", ghost: "text-amber", ring: "hover:border-amber/30" },
  blue: { box: "bg-blue/15 text-blue", ghost: "text-blue", ring: "hover:border-blue/30" },
  sage: { box: "bg-sage/15 text-sage", ghost: "text-sage", ring: "hover:border-sage/30" },
  rose: { box: "bg-rose/15 text-rose", ghost: "text-rose", ring: "hover:border-rose/30" },
}

export function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  accent = "amber",
  className,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  subtitle?: string
  onClick: () => void
  accent?: Accent
  className?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const colors = accentClasses[accent]

  const bounce = () => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: "back.out(3)" })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        bounce()
        onClick()
      }}
      className={clsx(
        "feature-card no-drag group relative text-left rounded-2xl border border-line bg-paper-raised p-6 h-[164px] flex flex-col gap-3.5 overflow-hidden hover:bg-black/[0.02] transition-colors duration-200",
        colors.ring,
        className
      )}
    >
      <Icon size={84} strokeWidth={1.25} className={clsx("absolute -right-4 -bottom-4 opacity-[0.07] pointer-events-none group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-300", colors.ghost)} />

      <div className={clsx("relative w-12 h-12 rounded-xl grid place-items-center shrink-0", colors.box)}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="relative min-w-0">
        <div className="text-[17px] font-semibold text-ink truncate">{title}</div>
        <div className="text-[13.5px] text-ink-soft mt-1 leading-snug line-clamp-2">{subtitle ?? " "}</div>
      </div>
    </button>
  )
}
