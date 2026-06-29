import { jsPDF } from "jspdf"
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  PageBreak,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  TextRun,
  TableOfContents,
} from "docx"
import { parseTiptapJson, type DocBlock } from "./docModel"
import { sectionLabels } from "./bookBlueprint"
import { en } from "../i18n/en"
import { da } from "../i18n/da"
import type { BookChapter, BookProject, Lang } from "../types"

function dict(lang: Lang) {
  return lang === "da" ? da : en
}

async function save(buffer: ArrayBuffer, defaultName: string, filters: { name: string; extensions: string[] }[]) {
  return window.myna.exportFile.saveBuffer({ defaultName, filters, buffer })
}

function chapterDisplayTitle(chapter: BookChapter, chapterNumber: number, lang: Lang) {
  const labels = sectionLabels(lang)
  const t = dict(lang)
  if (chapter.kind === "front" || chapter.kind === "back") return labels[chapter.sectionType ?? ""] ?? chapter.title
  return `${t.books.chapterLabel} ${chapterNumber}: ${chapter.title || t.books.untitledChapter}`
}

export async function exportManuscriptAsPdf(project: BookProject, chapters: BookChapter[], lang: Lang = "en") {
  const t = dict(lang)
  const labels = sectionLabels(lang)
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const margin = 64
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageCenter = doc.internal.pageSize.getWidth() / 2

  const front = chapters.filter((c) => c.kind === "front")
  const numbered = chapters.filter((c) => (c.kind ?? "chapter") === "chapter")
  const back = chapters.filter((c) => c.kind === "back")

  const tocEntries: { label: string; page: number }[] = []
  let tocPage = -1

  const renderChapterBody = (content: string) => {
    let y = margin + 30
    const ensureSpace = (lineHeight: number) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }
    const blocks = parseTiptapJson(content)
    blocks.forEach((b: DocBlock) => {
      let size = 11.5
      let style: "normal" | "bold" | "italic" = "normal"
      let prefix = ""
      if (b.type === "heading1") {
        size = 17
        style = "bold"
      } else if (b.type === "heading2") {
        size = 13
        style = "bold"
      } else if (b.type === "heading3") {
        size = 12
        style = "bold"
      } else if (b.type === "quote") style = "italic"
      else if (b.type === "bullet") prefix = "•  "
      else if (b.type === "ordered") prefix = "1. "

      doc.setFont("times", style)
      doc.setFontSize(size)
      const text = prefix + b.text
      const lines = doc.splitTextToSize(text, pageWidth)
      const lineHeight = size * 1.6
      lines.forEach((line: string) => {
        ensureSpace(lineHeight)
        doc.text(line, margin, y)
        y += lineHeight
      })
      y += 6
    })
  }

  // Title page
  doc.setFont("times", "bold")
  doc.setFontSize(28)
  const titleLines = doc.splitTextToSize(project.title || t.books.untitledManuscript, pageWidth)
  doc.text(titleLines, pageCenter, pageHeight / 2 - titleLines.length * 16, { align: "center" })
  doc.setFont("times", "italic")
  doc.setFontSize(14)
  doc.text(project.authorName || t.books.seedAuthorNameFallback, pageCenter, pageHeight / 2 + 20, { align: "center" })

  // Copyright page
  doc.addPage()
  const copyrightChapter = front.find((c) => c.sectionType === "copyright")
  doc.setFont("times", "normal")
  doc.setFontSize(11)
  if (copyrightChapter) renderChapterBody(copyrightChapter.content)

  // Reserve TOC page (filled in after we know chapter page numbers)
  doc.addPage()
  tocPage = doc.getNumberOfPages()

  // Dedication
  const dedicationChapter = front.find((c) => c.sectionType === "dedication")
  if (dedicationChapter) {
    doc.addPage()
    renderChapterBody(dedicationChapter.content)
  }

  // Introduction
  const introChapter = front.find((c) => c.sectionType === "introduction")
  if (introChapter) {
    doc.addPage()
    doc.setFont("times", "bold")
    doc.setFontSize(17)
    doc.text(t.books.sectionIntroduction, margin, margin)
    renderChapterBody(introChapter.content)
  }

  // Chapters
  numbered.forEach((chapter, i) => {
    doc.addPage()
    const pageNum = doc.getNumberOfPages()
    tocEntries.push({ label: chapterDisplayTitle(chapter, i + 1, lang), page: pageNum })
    doc.setFont("times", "bold")
    doc.setFontSize(17)
    doc.text(chapterDisplayTitle(chapter, i + 1, lang), margin, margin)
    renderChapterBody(chapter.content)
  })

  // Back matter
  back.forEach((chapter) => {
    doc.addPage()
    const pageNum = doc.getNumberOfPages()
    tocEntries.push({ label: labels[chapter.sectionType ?? ""] ?? chapter.title, page: pageNum })
    doc.setFont("times", "bold")
    doc.setFontSize(17)
    doc.text(chapter.title || labels[chapter.sectionType ?? ""] || "", margin, margin)
    renderChapterBody(chapter.content)
  })

  // Fill in the reserved TOC page
  doc.setPage(tocPage)
  doc.setFont("times", "bold")
  doc.setFontSize(20)
  doc.text(t.books.sectionToc, margin, margin)
  doc.setFont("times", "normal")
  doc.setFontSize(12)
  let tocY = margin + 40
  tocEntries.forEach((e) => {
    doc.text(e.label, margin, tocY)
    doc.text(String(e.page), pageWidth + margin, tocY, { align: "right" })
    tocY += 22
  })

  // Running headers/footers + page numbers on every page
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont("times", "normal")
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(project.title || t.books.untitledManuscript, margin, 36)
    doc.text(project.authorName || "", doc.internal.pageSize.getWidth() - margin, 36, { align: "right" })
    doc.text(String(p), pageCenter, pageHeight - 30, { align: "center" })
    doc.setTextColor(0)
  }

  const buf = doc.output("arraybuffer")
  return save(buf, `${project.title || "manuscript"}.pdf`, [{ name: "PDF", extensions: ["pdf"] }])
}

function blocksToParagraphs(blocks: DocBlock[]): Paragraph[] {
  return blocks.map((b) => {
    if (b.type === "heading1") return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2 })
    if (b.type === "heading2") return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_3 })
    if (b.type === "heading3") return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_4 })
    if (b.type === "bullet") return new Paragraph({ text: b.text, bullet: { level: 0 } })
    if (b.type === "quote") return new Paragraph({ children: [new TextRun({ text: b.text, italics: true })] })
    return new Paragraph({ text: b.text })
  })
}

export async function exportManuscriptAsDocx(project: BookProject, chapters: BookChapter[], lang: Lang = "en") {
  const t = dict(lang)
  const labels = sectionLabels(lang)
  const front = chapters.filter((c) => c.kind === "front")
  const numbered = chapters.filter((c) => (c.kind ?? "chapter") === "chapter")
  const back = chapters.filter((c) => c.kind === "back")

  const paragraphs: (Paragraph | TableOfContents)[] = []

  paragraphs.push(new Paragraph({ text: project.title || t.books.untitledManuscript, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }))
  paragraphs.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: project.authorName || t.books.seedAuthorNameFallback, italics: true })] }))

  const copyrightChapter = front.find((c) => c.sectionType === "copyright")
  if (copyrightChapter) {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    paragraphs.push(...blocksToParagraphs(parseTiptapJson(copyrightChapter.content)))
  }

  paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
  paragraphs.push(new Paragraph({ text: t.books.sectionToc, heading: HeadingLevel.HEADING_1 }))
  paragraphs.push(new TableOfContents(t.books.sectionToc, { hyperlink: true, headingStyleRange: "1-1" }))

  const dedicationChapter = front.find((c) => c.sectionType === "dedication")
  if (dedicationChapter) {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    paragraphs.push(...blocksToParagraphs(parseTiptapJson(dedicationChapter.content)))
  }

  const introChapter = front.find((c) => c.sectionType === "introduction")
  if (introChapter) {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    paragraphs.push(new Paragraph({ text: t.books.sectionIntroduction, heading: HeadingLevel.HEADING_1 }))
    paragraphs.push(...blocksToParagraphs(parseTiptapJson(introChapter.content)))
  }

  numbered.forEach((chapter, i) => {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    paragraphs.push(new Paragraph({ text: chapterDisplayTitle(chapter, i + 1, lang), heading: HeadingLevel.HEADING_1 }))
    paragraphs.push(...blocksToParagraphs(parseTiptapJson(chapter.content)))
  })

  back.forEach((chapter) => {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    paragraphs.push(new Paragraph({ text: labels[chapter.sectionType ?? ""] ?? chapter.title, heading: HeadingLevel.HEADING_1 }))
    paragraphs.push(...blocksToParagraphs(parseTiptapJson(chapter.content)))
  })

  const header = new Header({
    children: [
      new Paragraph({
        tabStops: [{ type: "right", position: 9026 }],
        children: [new TextRun({ text: project.title || t.books.untitledManuscript, size: 18 }), new TextRun({ text: "\t" }), new TextRun({ text: project.authorName || "", size: 18 })],
      }),
    ],
  })
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT] })],
      }),
    ],
  })

  const doc = new Document({
    features: { updateFields: true },
    sections: [
      {
        headers: { default: header },
        footers: { default: footer },
        children: paragraphs,
      },
    ],
  })
  const blob = await Packer.toBlob(doc)
  const buf = await blob.arrayBuffer()
  return save(buf, `${project.title || "manuscript"}.docx`, [{ name: "Word Document", extensions: ["docx"] }])
}
