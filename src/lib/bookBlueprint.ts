import type { BookStylePreset, Lang } from "../types"
import { en } from "../i18n/en"
import { da } from "../i18n/da"

const NUMBER_WORDS = [
  "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
  "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY",
]

const ORDINAL_WORDS_DA = [
  "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم",
  "یازدهم", "دوازدهم", "سیزدهم", "چهاردهم", "پانزدهم", "شانزدهم", "هفدهم", "هجدهم", "نوزدهم", "بیستم",
]

function dict(lang: Lang) {
  return lang === "da" ? da : en
}

export function chapterNumberWord(index: number, lang: Lang = "en"): string {
  if (lang === "da") return ORDINAL_WORDS_DA[index] ?? `${index + 1}`
  return NUMBER_WORDS[index] ?? `${index + 1}`
}

function doc(content: object[]) {
  return JSON.stringify({ type: "doc", content })
}

function heading(level: 1 | 2 | 3, text: string) {
  return { type: "heading", attrs: { level }, content: text ? [{ type: "text", text }] : [] }
}

function paragraph(text = "") {
  return { type: "paragraph", content: text ? [{ type: "text", text }] : [] }
}

export function buildTitlePageContent(title: string, authorName: string, lang: Lang = "en"): string {
  const t = dict(lang)
  return doc([
    paragraph(),
    paragraph(),
    paragraph(),
    heading(1, title || t.books.seedTitlePageFallback),
    paragraph(),
    { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: authorName || t.books.seedAuthorNameFallback }] },
  ])
}

export function buildCopyrightPageContent(authorName: string, lang: Lang = "en"): string {
  const t = dict(lang)
  const year = new Date().getFullYear()
  return doc([
    paragraph(t.books.seedCopyright.replace("{year}", String(year)).replace("{author}", authorName || t.books.seedAuthorNameFallback)),
    paragraph(),
    paragraph(t.books.seedAllRightsReserved),
    paragraph(t.books.seedCopyrightNotice),
    paragraph(),
    paragraph(t.books.seedPublisher),
    paragraph(t.books.seedFirstEdition),
  ])
}

export function buildTocPlaceholderContent(lang: Lang = "en"): string {
  return doc([paragraph(dict(lang).books.seedTocPlaceholder)])
}

export function buildDedicationContent(lang: Lang = "en"): string {
  return doc([paragraph(), paragraph(), { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: dict(lang).books.seedDedication }] }])
}

export function buildIntroductionContent(lang: Lang = "en"): string {
  const t = dict(lang)
  return doc([heading(1, t.books.seedIntroductionHeading), paragraph(), paragraph(t.books.seedIntroductionBody)])
}

export function buildChapterContent(index: number, lang: Lang = "en"): string {
  const heading_ = dict(lang).books.seedChapterHeading.replace("{n}", chapterNumberWord(index, lang))
  return doc([heading(1, heading_), paragraph()])
}

export function sectionLabels(lang: Lang = "en"): Record<string, string> {
  const t = dict(lang)
  return {
    title: t.books.sectionTitle,
    copyright: t.books.sectionCopyright,
    toc: t.books.sectionToc,
    dedication: t.books.sectionDedication,
    introduction: t.books.sectionIntroduction,
    appendix: t.books.sectionAppendix,
    notes: t.books.sectionNotes,
  }
}

export function stylePresetLabels(lang: Lang = "en"): Record<BookStylePreset, string> {
  const t = dict(lang)
  return {
    novel: t.books.stylePresetNovel,
    nonfiction: t.books.stylePresetNonfiction,
    poetry: t.books.stylePresetPoetry,
    academic: t.books.stylePresetAcademic,
  }
}

export const stylePresetFontClass: Record<BookStylePreset, string> = {
  novel: "font-serif",
  nonfiction: "font-sans",
  poetry: "font-serif italic",
  academic: "font-sans",
}
