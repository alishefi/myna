import { jsPDF } from "jspdf"
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from "docx"
import { blocksToPlainText, parseTiptapJson, type DocBlock } from "./docModel"
import type { Note } from "../types"

async function save(buffer: ArrayBuffer, defaultName: string, filters: { name: string; extensions: string[] }[]) {
  const result = await window.myna.exportFile.saveBuffer({ defaultName, filters, buffer })
  return result
}

interface Exportable {
  title: string
  content: string
}

export async function exportNoteAsPdf(note: Exportable) {
  const blocks = parseTiptapJson(note.content)
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const margin = 56
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
  let y = margin

  const title = note.title || "Untitled note"
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  const titleLines = doc.splitTextToSize(title, pageWidth)
  doc.text(titleLines, margin, y)
  y += titleLines.length * 26 + 12

  const ensureSpace = (lineHeight: number) => {
    if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  blocks.forEach((b: DocBlock) => {
    let size = 11
    let style: "normal" | "bold" | "italic" = "normal"
    let prefix = ""
    if (b.type === "heading1") (size = 17), (style = "bold")
    else if (b.type === "heading2") (size = 14), (style = "bold")
    else if (b.type === "heading3") (size = 12), (style = "bold")
    else if (b.type === "quote") style = "italic"
    else if (b.type === "bullet") prefix = "•  "
    else if (b.type === "ordered") prefix = "1. "
    else if (b.type === "task") prefix = b.checked ? "☑ " : "☐ "
    else if (b.type === "code") (size = 10), (style = "normal")

    doc.setFont("helvetica", style)
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(prefix + b.text, pageWidth)
    const lineHeight = size * 1.5
    lines.forEach((line: string) => {
      ensureSpace(lineHeight)
      doc.text(line, margin, y)
      y += lineHeight
    })
    y += 4
  })

  const buf = doc.output("arraybuffer")
  return save(buf, `${title}.pdf`, [{ name: "PDF", extensions: ["pdf"] }])
}

export async function exportNoteAsDocx(note: Exportable) {
  const blocks = parseTiptapJson(note.content)
  const title = note.title || "Untitled note"

  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    }),
  ]

  blocks.forEach((b) => {
    if (b.type === "heading1") {
      paragraphs.push(new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_1 }))
    } else if (b.type === "heading2") {
      paragraphs.push(new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2 }))
    } else if (b.type === "heading3") {
      paragraphs.push(new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_3 }))
    } else if (b.type === "bullet") {
      paragraphs.push(new Paragraph({ text: b.text, bullet: { level: 0 } }))
    } else if (b.type === "ordered") {
      paragraphs.push(new Paragraph({ text: b.text, numbering: { reference: "ordered-list", level: 0 } }))
    } else if (b.type === "task") {
      paragraphs.push(new Paragraph({ text: `${b.checked ? "[x]" : "[ ]"} ${b.text}` }))
    } else if (b.type === "quote") {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: b.text, italics: true })],
          indent: { left: 360 },
        })
      )
    } else if (b.type === "code") {
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: b.text, font: "Consolas" })] })
      )
    } else {
      paragraphs.push(new Paragraph({ text: b.text }))
    }
  })

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "ordered-list",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "start" }],
        },
      ],
    },
    sections: [{ children: paragraphs }],
  })

  const blob = await Packer.toBlob(doc)
  const buf = await blob.arrayBuffer()
  return save(buf, `${title}.docx`, [{ name: "Word Document", extensions: ["docx"] }])
}

export async function exportNoteAsMyna(note: Note) {
  const json = JSON.stringify(note, null, 2)
  const buf = new TextEncoder().encode(json).buffer
  return save(buf as ArrayBuffer, `${note.title || "untitled"}.myna`, [{ name: "Myna Note", extensions: ["myna"] }])
}

export function notePlainText(note: Note): string {
  return blocksToPlainText(parseTiptapJson(note.content))
}

export async function exportNoteAsTxt(note: Note) {
  const title = note.title || "Untitled note"
  const text = `${title}\n\n${notePlainText(note)}`
  const buf = new TextEncoder().encode(text).buffer
  return save(buf as ArrayBuffer, `${title}.txt`, [{ name: "Plain Text", extensions: ["txt"] }])
}

export function noteFromImportedJson(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") return null
  const data = raw as Partial<Note>
  if (typeof data.content !== "string") return null
  const now = Date.now()
  return {
    id: `note_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof data.title === "string" ? data.title : "Imported note",
    content: data.content,
    preview: typeof data.preview === "string" ? data.preview : "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    pinned: false,
    citations: Array.isArray(data.citations) ? data.citations : undefined,
    createdAt: now,
    updatedAt: now,
  }
}
