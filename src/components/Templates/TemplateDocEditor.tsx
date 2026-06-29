import { useEditor, EditorContent } from "@tiptap/react"
import { ArrowLeft } from "lucide-react"
import { buildExtensions } from "../Editor/extensions"
import { TemplateDocToolbar } from "./TemplateDocToolbar"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { exportNoteAsDocx, exportNoteAsMyna, exportNoteAsPdf } from "../../lib/exportNote"

export function TemplateDocEditor() {
  const { t, lang } = useI18n()
  const templateDoc = useUiStore((s) => s.templateDoc)
  const closeTemplateDoc = useUiStore((s) => s.closeTemplateDoc)

  const note = useAppStore((s) => (templateDoc?.kind === "note" ? s.notes.find((n) => n.id === templateDoc.id) : undefined))
  const tpl = useAppStore((s) => (templateDoc?.kind === "template" ? s.customTemplates.find((t) => t.id === templateDoc.id) : undefined))
  const updateNote = useAppStore((s) => s.updateNote)
  const deleteNote = useAppStore((s) => s.deleteNote)
  const updateCustomTemplate = useAppStore((s) => s.updateCustomTemplate)
  const deleteCustomTemplate = useAppStore((s) => s.deleteCustomTemplate)

  const title = note?.title ?? tpl?.name ?? ""
  const content = note?.content ?? tpl?.content ?? ""
  const docId = note?.id ?? tpl?.id

  const editor = useEditor(
    {
      extensions: buildExtensions("", lang),
      content: content ? safeParse(content) : "",
      onUpdate: ({ editor }) => {
        const json = JSON.stringify(editor.getJSON())
        if (note) updateNote(note.id, { content: json })
        else if (tpl) updateCustomTemplate(tpl.id, { content: json })
      },
    },
    [docId, lang]
  )

  if (!note && !tpl) return null

  const handleExport = async (kind: "pdf" | "docx" | "myna") => {
    if (kind === "pdf") await exportNoteAsPdf({ title: title || t.common.untitled, content })
    else if (kind === "docx") await exportNoteAsDocx({ title: title || t.common.untitled, content })
    else if (note) await exportNoteAsMyna(note)
  }

  const handleDelete = () => {
    if (note) deleteNote(note.id)
    else if (tpl) deleteCustomTemplate(tpl.id)
    closeTemplateDoc()
  }

  return (
    <div className="h-full flex flex-col bg-black/4 print:bg-paper">
      <div className="flex items-center gap-4 px-4 h-9 shrink-0 print:hidden bg-paper border-b border-line/60">
        <button type="button" onClick={closeTemplateDoc} className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink shrink-0">
          <ArrowLeft size={14} />
          {t.templates.backToTemplates}
        </button>
        {tpl && (
          <input
            value={tpl.name}
            onChange={(e) => updateCustomTemplate(tpl.id, { name: e.target.value })}
            placeholder={t.templates.templateNamePlaceholder}
            className="no-drag flex-1 max-w-[320px] bg-transparent outline-none text-[13px] font-medium text-ink placeholder:text-ink-soft/50"
          />
        )}
      </div>
      <div className="print:hidden">
        <TemplateDocToolbar editor={editor} onExport={handleExport} onDelete={handleDelete} onSaveNow={() => useAppStore.getState().saveNow()} />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin print:overflow-visible">
        <div className="template-doc-canvas max-w-[760px] mx-auto my-10 px-16 py-14 bg-paper-raised rounded-lg shadow-md print:shadow-none print:my-0 print:max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

function safeParse(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}
