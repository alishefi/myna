import type { Editor } from "@tiptap/react"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Highlighter,
  Type,
  ChevronDown,
  Undo2,
  Redo2,
  Wand,
  PenTool,
  Table as TableIcon,
  Minus,
  Quote,
  ListTree,
  Code2,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Save,
  Check,
  Trash2,
  MoreHorizontal,
  Download,
  Plus,
  X,
} from "lucide-react"
import { useI18n } from "../../i18n"
import { AiMenu } from "./AiMenu"

const highlightColors = ["#f6d9bf", "#cfe8d8", "#cfe0fb", "#f6c9d4", "#e6d9f8", "#d9ecf4"]
const textColors = ["#1b1c1e", "#6b6b6b", "#e8833f", "#4f7cff", "#7c9885", "#d97a86", "#b8860b", "#9b59b6"]

function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx(
        "no-drag h-8 w-8 grid place-items-center rounded-lg transition-colors shrink-0",
        active ? "bg-ink text-paper" : "text-ink-soft hover:bg-black/6 hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-line mx-1 shrink-0" />
}

function Dropdown({
  trigger,
  children,
  align = "left",
  panelClassName,
}: {
  trigger: (open: boolean, toggle: () => void) => React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  panelClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      {trigger(open, () => setOpen((v) => !v))}
      {open && (
        <div
          className={clsx(
            "absolute top-full mt-1.5 bg-paper-raised border border-ink/15 rounded-xl shadow-lg z-50 overflow-hidden",
            align === "left" ? "left-0" : "right-0",
            panelClassName
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function TableControls({ editor }: { editor: Editor }) {
  const { t } = useI18n()
  if (!editor.isActive("table")) return null
  return (
    <div className="no-drag flex items-center justify-center gap-1 px-3 py-1.5 border-b border-line/60 bg-blue/5 flex-wrap">
      <span className="text-[11px] font-medium text-ink-soft mr-1">{t.toolbar.table}</span>
      <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="no-drag flex items-center gap-1 text-[12px] px-2 py-1 rounded-md hover:bg-black/5 text-ink">
        <Plus size={12} /> {t.toolbar.row}
      </button>
      <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="no-drag flex items-center gap-1 text-[12px] px-2 py-1 rounded-md hover:bg-black/5 text-ink">
        <Plus size={12} /> {t.toolbar.column}
      </button>
      <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="no-drag flex items-center gap-1 text-[12px] px-2 py-1 rounded-md hover:bg-black/5 text-rose">
        <X size={12} /> {t.toolbar.row}
      </button>
      <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="no-drag flex items-center gap-1 text-[12px] px-2 py-1 rounded-md hover:bg-black/5 text-rose">
        <X size={12} /> {t.toolbar.column}
      </button>
      <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="no-drag flex items-center gap-1 text-[12px] px-2 py-1 rounded-md hover:bg-rose/10 text-rose">
        <Trash2 size={12} /> {t.toolbar.deleteTable}
      </button>
    </div>
  )
}

function LinkControl({ editor }: { editor: Editor }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const rangeRef = useRef<{ from: number; to: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const openPopover = () => {
    const { from, to } = editor.state.selection
    rangeRef.current = { from, to }
    const existing = editor.getAttributes("link").href as string | undefined
    setValue(existing ?? "https://")
    setOpen(true)
  }

  const apply = () => {
    const range = rangeRef.current
    if (!range) return
    const url = value.trim()
    if (!url) {
      editor.chain().focus().setTextSelection(range).unsetLink().run()
    } else if (range.from !== range.to) {
      editor.chain().focus().setTextSelection(range).setLink({ href: url }).run()
    } else {
      editor.chain().focus().insertContentAt(range.from, { type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run()
    }
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <ToolBtn title={t.toolbar.link} active={editor.isActive("link")} onClick={openPopover}>
        <Link2 size={15} />
      </ToolBtn>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-paper-raised border border-ink/15 rounded-xl shadow-lg p-2 flex items-center gap-1.5 w-64">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply()
              if (e.key === "Escape") setOpen(false)
            }}
            placeholder="https://"
            className="no-drag flex-1 bg-paper border border-line rounded-lg px-2 py-1.5 text-[12.5px] outline-none focus:border-ink/30"
          />
          <button type="button" onClick={apply} className="no-drag text-[12px] px-2.5 py-1.5 rounded-lg bg-ink text-paper font-medium shrink-0">
            {t.toolbar.applyLink}
          </button>
        </div>
      )}
    </div>
  )
}

export function EditorToolbar({
  editor,
  onExport,
  onDelete,
  onFocusMode,
  onSaveNow,
  focusMode,
}: {
  editor: Editor | null
  onExport: (kind: "pdf" | "docx" | "jpg" | "myna") => void
  onDelete: () => void
  onFocusMode: () => void
  onSaveNow: () => void
  focusMode: boolean
}) {
  const [justSaved, setJustSaved] = useState(false)
  const { t } = useI18n()
  if (!editor) return null

  const alignments = [
    { key: "left", icon: AlignLeft, label: t.toolbar.alignLeft },
    { key: "center", icon: AlignCenter, label: t.toolbar.alignCenter },
    { key: "right", icon: AlignRight, label: t.toolbar.alignRight },
    { key: "justify", icon: AlignJustify, label: t.toolbar.alignJustify },
  ] as const

  const handleSave = () => {
    onSaveNow()
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  const insertTableOfContents = () => {
    editor
      .chain()
      .focus()
      .insertContent([
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: t.toolbar.tocHeading }] },
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: t.toolbar.tocSection1 }] }] }],
        },
      ])
      .run()
  }

  const insertSubtitle = () => {
    editor.chain().focus().setParagraph().setFontSize("19px").setColor("#6b6b6b").run()
  }

  const activeAlign = alignments.find((a) => editor.isActive({ textAlign: a.key }))?.key ?? "left"
  const ActiveAlignIcon = alignments.find((a) => a.key === activeAlign)?.icon ?? AlignLeft

  const blockTypeLabel = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
      ? "H2"
      : editor.isActive("heading", { level: 3 })
        ? "H3"
        : t.toolbar.blockBody

  return (
    <div className="no-drag relative z-30 flex flex-col border-b border-line/70 bg-paper-raised/70 backdrop-blur-sm">
      <div className="no-drag flex items-center justify-center gap-0.5 px-3 py-2 flex-wrap">
        <ToolBtn title={t.toolbar.bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.underline} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolBtn>
        <Dropdown
          trigger={(open, toggle) => (
            <button type="button" title={t.toolbar.highlight} onClick={toggle} className={clsx("no-drag h-8 w-8 grid place-items-center rounded-lg transition-colors", open || editor.isActive("highlight") ? "bg-black/6" : "hover:bg-black/6")}>
              <Highlighter size={15} className="text-ink-soft" />
            </button>
          )}
          panelClassName="p-1.5 flex gap-1"
        >
          <button
            type="button"
            title={t.toolbar.removeHighlight}
            className="w-5 h-5 rounded-full border border-black/10 bg-paper grid place-items-center"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            <X size={10} className="text-ink-soft" />
          </button>
          {highlightColors.map((c) => (
            <button key={c} type="button" title={t.toolbar.highlightColor.replace("{color}", c)} className="w-5 h-5 rounded-full border border-black/10" style={{ background: c }} onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} />
          ))}
        </Dropdown>

        <Divider />

        <Dropdown
          trigger={(open, toggle) => (
            <button
              type="button"
              onClick={toggle}
              className={clsx("no-drag flex items-center gap-1 h-8 px-2 rounded-lg text-[13px] font-medium transition-colors", open ? "bg-black/6" : "hover:bg-black/6")}
            >
              <Type size={14} className="text-ink-soft" />
              {blockTypeLabel}
              <ChevronDown size={12} className="text-ink-soft" />
            </button>
          )}
          panelClassName="min-w-[170px] p-1"
        >
          <button type="button" className="no-drag w-full text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().setParagraph().run()}>
            {t.toolbar.body}
          </button>
          <button type="button" className="no-drag w-full text-left text-[14px] text-ink-soft px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={insertSubtitle}>
            {t.toolbar.subtitle}
          </button>
          <button type="button" className="no-drag w-full text-left text-[15px] font-semibold px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            {t.toolbar.heading1}
          </button>
          <button type="button" className="no-drag w-full text-left text-[14px] font-semibold px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            {t.toolbar.heading2}
          </button>
          <button type="button" className="no-drag w-full text-left text-[13px] font-semibold px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            {t.toolbar.heading3}
          </button>
        </Dropdown>

        <Divider />

        <ToolBtn title={t.toolbar.undo} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.redo} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={15} />
        </ToolBtn>

        <Divider />

        <AiMenu editor={editor} />

        <Divider />

        <ToolBtn title={t.toolbar.focusMode} active={focusMode} onClick={onFocusMode}>
          <Wand size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.sketch} onClick={() => editor.chain().focus().insertSketchBlock().run()}>
          <PenTool size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.insertTable} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.divider} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.tableOfContents} onClick={insertTableOfContents}>
          <ListTree size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.codeBlock} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={15} />
        </ToolBtn>
        <LinkControl editor={editor} />

        <Divider />

        <Dropdown
          trigger={(open, toggle) => (
            <button type="button" title={t.toolbar.alignment} onClick={toggle} className={clsx("no-drag h-8 w-8 grid place-items-center rounded-lg transition-colors", open ? "bg-black/6" : "hover:bg-black/6")}>
              <ActiveAlignIcon size={15} className="text-ink-soft" />
            </button>
          )}
          panelClassName="p-1 flex gap-0.5"
        >
          {alignments.map((a) => (
            <button
              key={a.key}
              type="button"
              title={a.label}
              onClick={() => editor.chain().focus().setTextAlign(a.key).run()}
              className={clsx("no-drag h-8 w-8 grid place-items-center rounded-lg", editor.isActive({ textAlign: a.key }) ? "bg-ink text-paper" : "hover:bg-black/6 text-ink-soft")}
            >
              <a.icon size={15} />
            </button>
          ))}
        </Dropdown>

        <Dropdown
          trigger={(open, toggle) => (
            <button type="button" title={t.toolbar.textColor} onClick={toggle} className={clsx("no-drag h-8 w-8 grid place-items-center rounded-lg transition-colors", open ? "bg-black/6" : "hover:bg-black/6")}>
              <Palette size={15} className="text-ink-soft" />
            </button>
          )}
          panelClassName="p-2 w-[168px]"
        >
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {textColors.map((c) => (
              <button key={c} type="button" title={c} className="w-7 h-7 rounded-full border border-black/10" style={{ background: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
            ))}
          </div>
          <div className="flex items-center gap-1.5 border-t border-line/60 pt-2">
            <input
              type="color"
              title={t.toolbar.customColor}
              className="no-drag w-7 h-7 rounded-md border border-line cursor-pointer bg-transparent"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            />
            <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="no-drag flex-1 text-[12px] text-ink-soft hover:text-ink px-2 py-1 rounded-md hover:bg-black/5">
              {t.toolbar.resetColor}
            </button>
          </div>
        </Dropdown>

        <Divider />

        <button
          type="button"
          title={t.toolbar.save}
          onClick={handleSave}
          className={clsx(
            "no-drag flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium transition-colors shrink-0",
            justSaved ? "text-sage" : "text-ink-soft hover:bg-black/6 hover:text-ink"
          )}
        >
          {justSaved ? <Check size={14} /> : <Save size={14} />}
          {justSaved ? t.toolbar.saved : t.toolbar.save}
        </button>

        <ToolBtn title={t.toolbar.deleteNote} onClick={onDelete}>
          <Trash2 size={15} />
        </ToolBtn>

        <Dropdown
          align="right"
          trigger={(open, toggle) => (
            <button type="button" title={t.toolbar.more} onClick={toggle} className={clsx("no-drag h-8 w-8 grid place-items-center rounded-lg transition-colors", open ? "bg-black/6" : "hover:bg-black/6")}>
              <MoreHorizontal size={15} className="text-ink-soft" />
            </button>
          )}
          panelClassName="min-w-[180px] p-1.5"
        >
          <button type="button" className="no-drag w-full flex items-center gap-2 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => onExport("pdf")}>
            <Download size={14} className="text-ink-soft" /> {t.editor.exportPdf}
          </button>
          <button type="button" className="no-drag w-full flex items-center gap-2 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => onExport("docx")}>
            <Download size={14} className="text-ink-soft" /> {t.editor.exportDocx}
          </button>
          <button type="button" className="no-drag w-full flex items-center gap-2 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => onExport("myna")}>
            <Download size={14} className="text-ink-soft" /> {t.editor.exportMyna}
          </button>
        </Dropdown>
      </div>

      <TableControls editor={editor} />
    </div>
  )
}
