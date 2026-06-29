import type { MovieRecommendation } from "../types"

const SYSTEM_PROMPT = `You are a film curator generating a personalized daily watch-list. Suggest exactly 5 real, well-known movies the person hasn't already seen.
Reply with ONLY 5 lines, nothing else, in exactly this format (no numbering, no extra text):
Title | Year | Genre | One short, enticing sentence on why they'd like it today`

function buildPrompt(watched: string[], wishlist: string[]): string {
  const seen = watched.length ? `Movies they've already watched: ${watched.slice(0, 25).join(", ")}.` : "They haven't logged any watched movies yet."
  const want = wishlist.length ? `Movies already on their wishlist: ${wishlist.slice(0, 25).join(", ")}.` : ""
  return `${seen} ${want} Recommend 5 different movies (not in either list) that fit their taste, with a mix of genres.`
}

export function parseRecommendations(raw: string): MovieRecommendation[] {
  const items: MovieRecommendation[] = []
  for (const line of raw.split("\n")) {
    const parts = line.split("|").map((p) => p.trim())
    if (parts.length < 3) continue
    const [title, year, genre, ...rest] = parts
    if (!title) continue
    items.push({ title, year: year || undefined, genre: genre || undefined, reason: rest.join(" | ") || "" })
  }
  return items.slice(0, 5)
}

export async function generateDailyMovieRecommendations(watched: string[], wishlist: string[]): Promise<{ items: MovieRecommendation[] } | { error: string }> {
  const res = await window.myna.ai.call({ system: SYSTEM_PROMPT, prompt: buildPrompt(watched, wishlist), maxTokens: 400 })
  if (res.error || !res.text) return { error: res.error ?? "Could not load recommendations." }
  const items = parseRecommendations(res.text)
  if (!items.length) return { error: "Could not load recommendations." }
  return { items }
}
