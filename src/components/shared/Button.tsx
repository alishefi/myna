import type { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "subtle"
  size?: "sm" | "md"
  icon?: ReactNode
}

export function Button({ variant = "ghost", size = "md", icon, className, children, ...rest }: Props) {
  return (
    <button
      className={clsx(
        "no-drag inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
        size === "sm" ? "text-[13px] px-3 py-1.5" : "text-sm px-4 py-2.5",
        variant === "primary" && "bg-ink text-paper hover:bg-amber",
        variant === "outline" && "border border-line text-ink hover:border-ink/40 bg-paper-raised",
        variant === "ghost" && "text-ink-soft hover:text-ink hover:bg-black/5",
        variant === "subtle" && "bg-black/4 text-ink hover:bg-black/8",
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
