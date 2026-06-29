import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import CharacterCount from "@tiptap/extension-character-count"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Image from "@tiptap/extension-image"
import { Callout } from "./CalloutExtension"
import { FontSize } from "./FontSizeExtension"
import { Vocabulary } from "./VocabularyExtension"
import { Toggle } from "./ToggleExtension"
import { AcademicInputRules } from "./AcademicInputRules"
import { MathBlock } from "./MathBlockExtension"
import { Footnote } from "./FootnoteExtension"
import { Citation } from "./CitationExtension"
import { Columns, Column } from "./ColumnsExtension"
import { NoteLink } from "./NoteLinkExtension"
import { Attachment } from "./AttachmentExtension"
import { AudioBlock } from "./AudioExtension"
import { SketchBlock } from "./SketchExtension"
import { TrailingNode } from "./TrailingNodeExtension"
import type { Lang } from "../../types"

export function buildExtensions(placeholder: string, lang: Lang = "en") {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: lang === "da" ? "right" : "left" }),
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    Callout,
    Vocabulary,
    Toggle,
    AcademicInputRules,
    Image.configure({ inline: true, allowBase64: true }),
    MathBlock,
    Footnote,
    Citation,
    Columns,
    Column,
    NoteLink,
    Attachment,
    AudioBlock,
    SketchBlock,
    TrailingNode,
  ]
}
