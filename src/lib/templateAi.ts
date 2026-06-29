interface PMNode {
  type: string
  attrs?: Record<string, unknown>
  content?: PMNode[]
  text?: string
}

function textNode(value: string): PMNode {
  return { type: "text", text: value }
}

export function markdownToDoc(raw: string): { type: "doc"; content: PMNode[] } {
  const lines = raw.replace(/```[a-z]*\n?/gi, "").split("\n")
  const blocks: PMNode[] = []
  let pendingRows: string[][] = []

  const flushTable = () => {
    if (!pendingRows.length) return
    blocks.push({
      type: "table",
      content: pendingRows.map((cells, i) => ({
        type: "tableRow",
        content: cells.map((c) => ({ type: i === 0 ? "tableHeader" : "tableCell", content: [{ type: "paragraph", content: c ? [textNode(c)] : undefined }] })),
      })),
    })
    pendingRows = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushTable()
      continue
    }
    if (line === "---" || line === "—") {
      flushTable()
      blocks.push({ type: "horizontalRule" })
      continue
    }
    if (line.startsWith("# ")) {
      flushTable()
      blocks.push({ type: "heading", attrs: { level: 1, textAlign: "left" }, content: [textNode(line.slice(2).trim())] })
      continue
    }
    if (line.startsWith("## ")) {
      flushTable()
      blocks.push({ type: "heading", attrs: { level: 2, textAlign: "left" }, content: [textNode(line.slice(3).trim())] })
      continue
    }
    if (line.startsWith("### ")) {
      flushTable()
      blocks.push({ type: "heading", attrs: { level: 3, textAlign: "left" }, content: [textNode(line.slice(4).trim())] })
      continue
    }
    if (line.includes("|")) {
      pendingRows.push(
        line
          .split("|")
          .map((c) => c.trim())
          .filter((c, i, arr) => !(c === "" && (i === 0 || i === arr.length - 1)))
      )
      continue
    }
    flushTable()
    const text = line.startsWith("- ") ? line.slice(2).trim() : line
    blocks.push({ type: "paragraph", attrs: { textAlign: "left" }, content: [textNode(text)] })
  }
  flushTable()

  return { type: "doc", content: blocks.length ? blocks : [{ type: "paragraph" }] }
}

export type TemplateAiPreset = "resume" | "invoice" | "weddingCard" | "contract"

const SYSTEM_PROMPT = `You generate ready-to-fill document templates. Output ONLY the document content in this exact plain-text format, nothing else (no explanations, no code fences):
- A line starting with "# " is the big document title (only one).
- Lines starting with "## " are section headings.
- A line that is exactly "---" inserts a divider between sections.
- Table-like rows are written as cells separated by " | " on a single line (e.g. "Item | Price | Qty"); the first such row in a group is the header row.
- Any other non-empty line is normal paragraph text. Use "- " at the start of a line for a short labeled line like "- Date: ___".
Keep it concise, realistic, and structured so the user can fill in or adjust the placeholder details.`

const presetPrompts: Record<TemplateAiPreset, string> = {
  resume: "Generate a clean professional resume template with contact info, a summary, an experience section (as table rows: Company | Role | Dates), education, and skills.",
  invoice: "Generate a simple invoice template with business info, invoice number/date/due date, a billed-to section, an items table (Description | Qty | Rate | Total), and a totals section.",
  weddingCard: "Generate a warm wedding invitation template with the couple's names as the title, the date, time, venue, a short heartfelt message, and RSVP details.",
  contract: "Generate a short, simple service contract template with parties involved, scope of work, payment terms, duration, and a signatures section.",
}

export async function generateTemplateDoc(preset: TemplateAiPreset | "custom", customPrompt?: string): Promise<{ name: string; content: object } | { error: string }> {
  const prompt = preset === "custom" ? (customPrompt ?? "").trim() : presetPrompts[preset]
  if (!prompt) return { error: "Describe what you'd like to generate." }

  const res = await window.myna.ai.call({ system: SYSTEM_PROMPT, prompt, maxTokens: 1200 })
  if (res.error || !res.text) return { error: res.error ?? "Something went wrong. Please try again." }

  const doc = markdownToDoc(res.text)
  const firstHeading = doc.content.find((b) => b.type === "heading")
  const name = (firstHeading?.content?.[0]?.text as string | undefined) ?? "AI template"
  return { name, content: doc }
}
