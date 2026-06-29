import type { Lang } from "../types"
import { formatMonthDayDa } from "./dariDate"

export function relativeShort(ts: number, lang: Lang): string {
  const diffMs = Date.now() - ts
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (lang === "da") {
    if (minutes < 1) return "اکنون"
    if (minutes < 60) return `${minutes} د`
    if (hours < 24) return `${hours} س`
    if (days < 7) return `${days} ر`
    return formatMonthDayDa(ts)
  }

  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  const d = new Date(ts)
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`
}
