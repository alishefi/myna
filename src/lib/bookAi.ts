import type { Lang } from "../types"
import { en } from "../i18n/en"
import { da } from "../i18n/da"

const SYSTEM_PROMPT = `You are a skilled fiction co-writer helping someone past a block in their scene.
Read the scene text they give you and continue it in their own voice and tense. Offer exactly 3 different directions the scene could go next.
Reply with ONLY this format, nothing else, no preamble:
1) <first continuation, 2-4 sentences>
2) <second continuation, a different direction, 2-4 sentences>
3) <third continuation, yet another direction, 2-4 sentences>`

function dict(lang: Lang) {
  return lang === "da" ? da : en
}

export function parseSceneContinuations(raw: string): string[] {
  const matches = [...raw.matchAll(/(?:^|\n)\s*[123]\)\s*([\s\S]*?)(?=\n\s*[123]\)|$)/g)]
  return matches.map((m) => m[1].trim()).filter(Boolean)
}

export async function continueSceneThreeWays(sceneText: string, lang: Lang = "en"): Promise<{ options: string[] } | { error: string }> {
  const t = dict(lang)
  const text = sceneText.trim()
  if (!text) return { error: t.books.sceneFirstError }
  const res = await window.myna.ai.call({ system: SYSTEM_PROMPT, prompt: text.slice(-3000), maxTokens: 700 })
  if (res.error || !res.text) return { error: res.error ?? t.books.couldNotGenerateContinuations }
  const options = parseSceneContinuations(res.text)
  if (!options.length) return { error: t.books.couldNotGenerateContinuations }
  return { options }
}

async function runChapterAssist(system: string, chapterText: string, emptyMessage: string, genericError: string): Promise<{ text: string } | { error: string }> {
  const text = chapterText.trim()
  if (!text) return { error: emptyMessage }
  const res = await window.myna.ai.call({ system, prompt: text.slice(-6000), maxTokens: 600 })
  if (res.error || !res.text) return { error: res.error ?? genericError }
  return { text: res.text.trim() }
}

export function summarizeChapter(chapterText: string, lang: Lang = "en") {
  const t = dict(lang)
  return runChapterAssist(
    "You are a developmental editor. Summarize this book chapter in 3-5 concise sentences, capturing plot/argument progression and any open threads. Reply with only the summary.",
    chapterText,
    t.books.chapterFirstError,
    t.books.chapterAssistError
  )
}

export function suggestChapterEdits(chapterText: string, lang: Lang = "en") {
  const t = dict(lang)
  return runChapterAssist(
    "You are a developmental editor. Read this book chapter and suggest 3-6 concrete, actionable edits (pacing, structure, clarity, consistency). Reply as a short numbered list, nothing else.",
    chapterText,
    t.books.chapterFirstError,
    t.books.chapterAssistError
  )
}

export function improveChapterClarity(chapterText: string, lang: Lang = "en") {
  const t = dict(lang)
  return runChapterAssist(
    "You are a line editor. Rewrite the following chapter text to improve clarity and flow while preserving the author's voice, meaning, and length. Reply with only the rewritten text.",
    chapterText,
    t.books.chapterFirstError,
    t.books.chapterAssistError
  )
}
