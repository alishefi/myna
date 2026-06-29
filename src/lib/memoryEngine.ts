import type { Note } from "../types"
import { notePlainText } from "./exportNote"
import { isNoteEmpty } from "./noteEmpty"

const DAY = 24 * 60 * 60 * 1000

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "of", "in", "on", "for", "with", "that",
  "this", "it", "i", "you", "my", "your", "be", "as", "at", "by", "from", "have", "has", "had", "not", "so", "if",
  "just", "about", "into", "like", "also", "very", "can", "will", "would", "could", "should", "do", "does", "did",
  "there", "their", "they", "them", "we", "our", "me", "up", "out",
])

function keywordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  )
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const w of a) if (b.has(w)) intersection++
  const union = a.size + b.size - intersection
  return union ? intersection / union : 0
}

export interface ResurfacedNote {
  note: Note
  reason: "similar" | "onThisDay"
  similarity?: number
}

export function findResurfacedNotes(notes: Note[], limit = 3): ResurfacedNote[] {
  const real = notes.filter((n) => !isNoteEmpty(n) && notePlainText(n).trim().length > 40)
  if (real.length < 2) return []

  const now = Date.now()
  const recent = [...real].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)
  const older = real.filter((n) => now - n.updatedAt > 20 * DAY)

  const candidates: ResurfacedNote[] = []
  for (const r of recent) {
    const rKeywords = keywordSet(`${r.title} ${notePlainText(r)}`)
    let best: { note: Note; score: number } | null = null
    for (const o of older) {
      if (o.id === r.id) continue
      const score = jaccard(rKeywords, keywordSet(`${o.title} ${notePlainText(o)}`))
      if (score > 0.12 && (!best || score > best.score)) best = { note: o, score }
    }
    if (best) candidates.push({ note: best.note, reason: "similar", similarity: best.score })
  }

  const today = new Date()
  for (const n of older) {
    const d = new Date(n.createdAt)
    if (d.getDate() === today.getDate() && (d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear())) {
      if (!candidates.some((c) => c.note.id === n.id)) candidates.push({ note: n, reason: "onThisDay" })
    }
  }

  const seen = new Set<string>()
  const result: ResurfacedNote[] = []
  for (const c of candidates) {
    if (seen.has(c.note.id)) continue
    seen.add(c.note.id)
    result.push(c)
    if (result.length >= limit) break
  }
  return result
}

export function findUnfinishedIdeas(notes: Note[], limit = 3): Note[] {
  const now = Date.now()
  return notes
    .filter((n) => !n.pinned)
    .filter((n) => {
      const text = notePlainText(n).trim()
      const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0
      const untouchedDays = (now - n.updatedAt) / DAY
      return wordCount > 0 && wordCount < 60 && untouchedDays > 14
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
}
