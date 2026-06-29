import type { Editor } from "@tiptap/react"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Type,
  ChevronDown,
  Undo2,
  Redo2,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Save,
  Check,
  Trash2,
  Download,
  Plus,
  X,
} from "lucide-react"
import { useI18n } from "../../i18n"

const textColors = ["#1b1c1e", "#6b6b6b", "#e8833f", "#4f7cff", "#7c9885", "#d97a86"]

function ToolBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
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

export function TemplateDocToolbar({
  editor,
  onExport,
  onDelete,
  onSaveNow,
}: {
  editor: Editor | null
  onExport: (kind: "pdf" | "docx" | "myna") => void
  onDelete: () => void
  onSaveNow: () => void
}) {
  const { t } = useI18n()
  const [justSaved, setJustSaved] = useState(false)
  if (!editor) return null

  const alignments = [
    { key: "left", icon: AlignLeft, label: t.toolbar.alignLeft },
    { key: "center", icon: AlignCenter, label: t.toolbar.alignCenter },
    { key: "right", icon: AlignRight, label: t.toolbar.alignRight },
  ] as const

  const handleSave = () => {
    onSaveNow()
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  const activeAlign = alignments.find((a) => editor.isActive({ textAlign: a.key }))?.key ?? "left"
  const ActiveAlignIcon = alignments.find((a) => a.key === activeAlign)?.icon ?? AlignLeft

  const blockTypeLabel = editor.isActive("heading", { level: 1 })
    ? t.templates.titleBlock
    : editor.isActive("heading", { level: 2 })
      ? t.templates.headingBlock
      : editor.isActive("heading", { level: 3 })
        ? t.templates.labelBlock
        : t.templates.bodyBlock

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
          panelClassName="min-w-[160px] p-1"
        >
          <button type="button" className="no-drag w-full text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().setParagraph().run()}>
            {t.templates.bodyBlock}
          </button>
          <button type="button" className="no-drag w-full text-left text-[26px] font-bold leading-none px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            {t.templates.titleBlock}
          </button>
          <button type="button" className="no-drag w-full text-left text-[15px] font-semibold px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            {t.templates.headingBlock}
          </button>
          <button type="button" className="no-drag w-full text-left text-[12.5px] font-semibold uppercase tracking-wide px-2.5 py-1.5 rounded-md hover:bg-black/5" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            {t.templates.labelBlock}
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

        <ToolBtn title={t.toolbar.insertTable} onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon size={15} />
        </ToolBtn>
        <ToolBtn title={t.toolbar.dividerLine} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolBtn>

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
          panelClassName="p-2 w-[152px]"
        >
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {textColors.map((c) => (
              <button key={c} type="button" title={c} className="w-7 h-7 rounded-full border border-black/10" style={{ background: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
            ))}
          </div>
          <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="no-drag w-full text-[12px] text-ink-soft hover:text-ink px-2 py-1 rounded-md hover:bg-black/5 border-t border-line/60 pt-2">
            {t.toolbar.resetColor}
          </button>
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

        <ToolBtn title={t.toolbar.deleteDocument} onClick={onDelete}>
          <Trash2 size={15} />
        </ToolBtn>

        <Dropdown
          align="right"
          trigger={(open, toggle) => (
            <button type="button" title={t.toolbar.export} onClick={toggle} className={clsx("no-drag flex items-center gap-1 h-8 px-2 rounded-lg transition-colors", open ? "bg-black/6" : "hover:bg-black/6")}>
              <Download size={15} className="text-ink-soft" />
            </button>
          )}
          panelClassName="min-w-[170px] p-1.5"
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
