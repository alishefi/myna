export type AiAction =
  | "summarize"
  | "rewrite"
  | "structure"
  | "grammar"
  | "continue"
  | "ideas"
  | "translateToDari"
  | "translateToEnglish"
  | "tags"
  | "prompt"
  | "flashcards"
  | "examSummary"
  | "expand"
  | "keyPoints"
  | "bookOutline"
  | "bookChapter"
  | "contentSection"
  | "blogPost"

const systemPrompts: Record<AiAction, string> = {
  summarize: "You summarize personal journal/notes content concisely and warmly. Reply with only the summary, no preamble.",
  rewrite: "You rewrite the user's note to be clearer and more polished while preserving their voice and meaning. Reply with only the rewritten text.",
  structure: "You restructure the user's note into clean, well-organized prose or lists with headings where useful. Reply with only the restructured text, using simple markdown (# headings, - lists, **bold**).",
  grammar: "You correct grammar and spelling in the user's text while preserving their tone and meaning exactly. Reply with only the corrected text.",
  continue: "You continue the user's note in their own voice and tone, picking up naturally from where it left off. Reply with only the continuation, 2-4 sentences.",
  ideas: "You generate a short list of writing ideas or angles related to the user's note. Reply with only a markdown bullet list of 4-6 short ideas.",
  translateToDari: "You translate the user's text into natural, fluent Dari (Afghan Persian). Reply with only the Dari translation.",
  translateToEnglish: "You translate the user's text into natural, fluent English. Reply with only the English translation.",
  tags: "You suggest 3-6 short topical tags for the user's note. Reply with only a comma-separated list of tags, lowercase, no hashtags.",
  prompt: "You suggest one thoughtful, gentle journaling prompt inspired by the user's note or history. Reply with only the single prompt question.",
  flashcards:
    "You are a study assistant. Read the student's notes and produce 6-12 flashcards covering the key facts, terms, and concepts. " +
    "Reply with ONLY the flashcards, one per pair of lines, in exactly this format and nothing else:\nQ: <question>\nA: <answer>\n\n" +
    "Each question should be short and specific; each answer should be concise (1-2 sentences).",
  examSummary:
    "You are a study assistant preparing a student for an exam. Read their notes and produce a structured exam-prep summary using simple markdown: " +
    "a short list of key concepts (## Key Concepts as bullets), important definitions (## Definitions), and 3-5 likely exam questions (## Practice Questions). " +
    "Be concise and concrete. Reply with only the structured summary.",
  expand: "You expand the user's text with more detail, supporting examples, and elaboration, while preserving their voice and intent. Reply with only the expanded text.",
  keyPoints: "You extract the key points from the user's text. Reply with only a concise markdown bullet list of the key points, no preamble.",
  bookOutline:
    "You are a book-writing assistant. Based on the user's notes/idea, produce a compelling book outline: a working title, a one-paragraph premise, and a chapter-by-chapter breakdown (## Chapters as a numbered list, each with a one-line description). Reply with only the outline, using simple markdown.",
  bookChapter:
    "You are a ghostwriter. Based on the user's notes, write the opening of a book chapter in an engaging, immersive narrative voice that matches their tone. Reply with only the chapter text, 3-5 paragraphs, no preamble.",
  contentSection:
    "You are a content writer. Based on the user's notes, write a polished section of long-form content (e.g. for an article or guide) with a short heading and well-structured paragraphs. Reply with only the section, using simple markdown (## heading, paragraphs, occasional - bullets).",
  blogPost:
    "You are a blog writer. Based on the user's notes, write a complete, engaging blog post: a catchy title, a short hook intro, 2-4 body sections with headings, and a brief closing thought. Reply with only the post, using simple markdown.",
}

const longActions = new Set<AiAction>(["ideas", "structure", "flashcards", "examSummary", "expand", "bookOutline", "bookChapter", "contentSection", "blogPost"])

export async function runAi(action: AiAction, text: string): Promise<{ text?: string; error?: string }> {
  const system = systemPrompts[action]
  const maxTokens = longActions.has(action) ? 1400 : 600
  return window.myna.ai.call({ system, prompt: text, maxTokens })
}

export function parseFlashcards(raw: string): { question: string; answer: string }[] {
  const cards: { question: string; answer: string }[] = []
  const lines = raw.split("\n")
  let pendingQ: string | null = null
  for (const line of lines) {
    const qMatch = line.match(/^\s*Q:\s*(.+)$/i)
    const aMatch = line.match(/^\s*A:\s*(.+)$/i)
    if (qMatch) {
      pendingQ = qMatch[1].trim()
    } else if (aMatch && pendingQ) {
      cards.push({ question: pendingQ, answer: aMatch[1].trim() })
      pendingQ = null
    }
  }
  return cards
}
