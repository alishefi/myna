import type { MemoryInsights } from "../types"

const SYSTEM_PROMPT = `You are a thoughtful personal memory assistant reading someone's private journal excerpts and mood log.
Identify real, specific patterns — never generic filler. Reply with ONLY these 5 lines, nothing else, no markdown, no extra commentary:
TOPICS: 3-5 short topics they write about often, comma separated
EMOTION: one short, warm sentence naming their recent emotional pattern
GOALS: 2-4 recurring goals or intentions they keep returning to, comma separated
STYLE: one short sentence describing their writing voice or style
PROMPT: one personalized, specific journaling prompt for today that nods to one of their patterns`

function buildPrompt(noteExcerpts: string[], moods: string[]): string {
  const notesPart = noteExcerpts.length
    ? `Recent journal excerpts:\n${noteExcerpts.map((e, i) => `${i + 1}. ${e}`).join("\n")}`
    : "They haven't written much yet — keep it general and inviting."
  const moodPart = moods.length ? `Recent moods logged: ${moods.join(", ")}.` : ""
  return `${notesPart}\n${moodPart}`
}

export function parseMemoryInsights(raw: string): Omit<MemoryInsights, "date"> | null {
  const get = (key: string) => raw.match(new RegExp(`${key}:\\s*(.+)`, "i"))?.[1]?.trim()
  const topics = get("TOPICS")
  const emotion = get("EMOTION")
  const goals = get("GOALS")
  const style = get("STYLE")
  const prompt = get("PROMPT")
  if (!prompt) return null
  return {
    topics: topics ? topics.split(",").map((s) => s.trim()).filter(Boolean) : [],
    emotion: emotion ?? "",
    goals: goals ? goals.split(",").map((s) => s.trim()).filter(Boolean) : [],
    style: style ?? "",
    prompt,
  }
}

export async function generateMemoryInsights(noteExcerpts: string[], moods: string[]): Promise<{ insights: Omit<MemoryInsights, "date"> } | { error: string }> {
  const res = await window.myna.ai.call({ system: SYSTEM_PROMPT, prompt: buildPrompt(noteExcerpts, moods), maxTokens: 350 })
  if (res.error || !res.text) return { error: res.error ?? "Could not load memory insights." }
  const parsed = parseMemoryInsights(res.text)
  if (!parsed) return { error: "Could not load memory insights." }
  return { insights: parsed }
}
