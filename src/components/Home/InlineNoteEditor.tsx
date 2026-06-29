import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { Maximize2 } from "lucide-react"
import { buildExtensions } from "../Editor/extensions"
import { EditorToolbar } from "../Editor/EditorToolbar"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { isNoteEmpty } from "../../lib/noteEmpty"
import { setActiveEditor } from "../../lib/activeEditor"

export function InlineNoteEditor() {
  const { t, lang } = useI18n()
  const createNote = useAppStore((s) => s.createNote)
  const updateNote = useAppStore((s) => s.updateNote)
  const deleteNote = useAppStore((s) => s.deleteNote)
  const openEditor = useUiStore((s) => s.openEditor)
  const editorOpen = useUiStore((s) => s.editorOpen)
  const editingNoteId = useUiStore((s) => s.editingNoteId)

  const [title, setTitle] = useState("")
  const draftIdRef = useRef<string | null>(null)

  const editor = useEditor({
    extensions: buildExtensions(t.home.writingPlaceholder, lang),
    content: "",
  })

  const ensureNote = () => {
    if (draftIdRef.current) return draftIdRef.current
    const note = createNote({ title })
    draftIdRef.current = note.id
    return note.id
  }

  useEffect(() => {
    if (!editor) return
    const handler = () => {
      const id = ensureNote()
      updateNote(id, { content: JSON.stringify(editor.getJSON()) })
    }
    editor.on("update", handler)
    return () => {
      editor.off("update", handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const onFocus = () => setActiveEditor(editor, draftIdRef.current)
    editor.on("focus", onFocus)
    return () => {
      editor.off("focus", onFocus)
    }
  }, [editor])

  const wasOpenRef = useRef(false)
  useEffect(() => {
    const wasOurs = wasOpenRef.current && editingNoteId === draftIdRef.current
    if (wasOurs && !editorOpen) {
      draftIdRef.current = null
      setTitle("")
      editor?.commands.clearContent()
    }
    wasOpenRef.current = editorOpen
  }, [editorOpen, editingNoteId, editor])

  useEffect(() => {
    return () => {
      const id = draftIdRef.current
      if (!id) return
      const current = useAppStore.getState().notes.find((n) => n.id === id)
      if (current && isNoteEmpty(current)) {
        useAppStore.getState().deleteNote(id)
      }
    }
  }, [])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    const id = ensureNote()
    updateNote(id, { title: value })
  }

  const expand = () => {
    const id = ensureNote()
    openEditor(id)
  }

  const handleDelete = () => {
    if (draftIdRef.current) deleteNote(draftIdRef.current)
    draftIdRef.current = null
    setTitle("")
    editor?.commands.clearContent()
  }

  return (
    <div className="no-drag relative w-full rounded-2xl border-t border-x border-line bg-paper-raised hover:border-ink/20 transition-colors overflow-hidden">
      <EditorToolbar
        editor={editor}
        onExport={expand}
        onDelete={handleDelete}
        onFocusMode={expand}
        onSaveNow={() => useAppStore.getState().saveNow()}
        focusMode={false}
      />

      <button
        type="button"
        title="Open in full screen"
        onClick={expand}
        className="no-drag absolute top-2.5 right-3 z-40 w-7 h-7 rounded-lg grid place-items-center text-ink-soft/60 hover:text-ink hover:bg-black/5 transition-colors"
      >
        <Maximize2 size={13} />
      </button>

      <div className="px-6 pt-5 pb-1">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t.editor.untitled}
          className="w-full bg-transparent outline-none font-serif text-[20px] font-medium text-ink placeholder:text-ink-soft/45"
        />
      </div>

      <div
        onClick={() => editor?.commands.focus()}
        className="px-8 pb-6 min-h-[340px] max-h-[460px] overflow-y-auto scrollbar-thin cursor-text"
      >
        <EditorContent editor={editor} />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-paper to-transparent" />
    </div>
  )
}
