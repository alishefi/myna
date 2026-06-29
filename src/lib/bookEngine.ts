import { blocksToPlainText, parseTiptapJson } from "./docModel"
import type { BookWordSnapshot } from "../types"

export function tiptapWordCount(content: string): number {
  const text = blocksToPlainText(parseTiptapJson(content)).trim()
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function upsertWordHistory(history: BookWordSnapshot[], total: number): BookWordSnapshot[] {
  const today = todayKey()
  const idx = history.findIndex((h) => h.date === today)
  if (idx >= 0) {
    const next = [...history]
    next[idx] = { date: today, total }
    return next
  }
  return [...history, { date: today, total }]
}

export function wordsWrittenToday(history: BookWordSnapshot[], currentTotal: number): number {
  const today = todayKey()
  const prior = history.filter((h) => h.date < today).sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  return Math.max(0, currentTotal - (prior?.total ?? 0))
}
