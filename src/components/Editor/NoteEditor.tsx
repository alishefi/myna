import { useEditor, EditorContent } from "@tiptap/react"
import type { EditorView } from "@tiptap/pm/view"
import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import { buildExtensions } from "./extensions"
import { EditorToolbar } from "./EditorToolbar"
import { BubbleToolbar } from "./BubbleToolbar"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { exportNoteAsDocx, exportNoteAsMyna, exportNoteAsPdf } from "../../lib/exportNote"
import { setActiveEditor } from "../../lib/activeEditor"
import type { Note } from "../../types"

function insertImageAt(view: EditorView, pos: number, file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const node = view.state.schema.nodes.image.create({ src: reader.result })
    const tr = view.state.tr.insert(pos, node)
    view.dispatch(tr)
  }
  reader.readAsDataURL(file)
}

export function NoteEditor({
  note,
  onDelete,
}: {
  note: Note
  onDelete: () => void
}) {
  const { t, lang } = useI18n()
  const updateNote = useAppStore((s) => s.updateNote)
  const titleRef = useRef<HTMLInputElement>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [counts, setCounts] = useState({ words: 0, characters: 0 })

  const editor = useEditor(
    {
      extensions: buildExtensions(t.editor.placeholder, lang),
      content: note.content ? safeParse(note.content) : "",
      onUpdate: ({ editor }) => {
        const json = JSON.stringify(editor.getJSON())
        updateNote(note.id, { content: json })
        setCounts({
          words: editor.storage.characterCount.words(),
          characters: editor.storage.characterCount.characters(),
        })
      },
      editorProps: {
        handleDrop: (view, event) => {
          const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"))
          if (!files.length) return false
          event.preventDefault()
          const coords = { left: event.clientX, top: event.clientY }
          const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from
          files.forEach((file) => insertImageAt(view, pos, file))
          return true
        },
        handlePaste: (view, event) => {
          const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"))
          if (!files.length) return false
          event.preventDefault()
          files.forEach((file) => insertImageAt(view, view.state.selection.from, file))
          return true
        },
      },
    },
    [note.id, lang]
  )

  useEffect(() => {
    if (editor) {
      setCounts({
        words: editor.storage.characterCount.words(),
        characters: editor.storage.characterCount.characters(),
      })
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    setActiveEditor(editor, note.id)
    const onFocus = () => setActiveEditor(editor, note.id)
    editor.on("focus", onFocus)
    return () => {
      editor.off("focus", onFocus)
      setActiveEditor(null)
    }
  }, [editor, note.id])

  useEffect(() => {
    if (!note.title && titleRef.current) {
      requestAnimationFrame(() => titleRef.current?.focus())
    }
  }, [note.id, note.title])

  const handleExport = async (kind: "pdf" | "docx" | "jpg" | "myna") => {
    if (kind === "pdf") await exportNoteAsPdf(note)
    else if (kind === "docx") await exportNoteAsDocx(note)
    else if (kind === "myna") await exportNoteAsMyna(note)
  }

  return (
    <div className="flex flex-col h-full flex-1 min-w-0">
      {!focusMode && (
        <div className="print:hidden">
          <EditorToolbar
            editor={editor}
            onExport={handleExport}
            onDelete={onDelete}
            onFocusMode={() => setFocusMode(true)}
            onSaveNow={() => useAppStore.getState().saveNow()}
            focusMode={focusMode}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-thin relative flex print:overflow-visible">
        <div className={clsx("flex-1", focusMode ? "max-w-[680px] mx-auto px-12 py-16" : "max-w-[820px] mx-auto px-10 py-12")}>
          <input
            ref={titleRef}
            value={note.title}
            onChange={(e) => updateNote(note.id, { title: e.target.value })}
            placeholder={t.editor.untitled}
            className="w-full bg-transparent outline-none font-serif text-[38px] font-medium text-ink placeholder:text-ink-soft/50 mb-3"
            dir="auto"
          />
          <div className="print:hidden">
            <BubbleToolbar editor={editor} />
          </div>
          <EditorContent editor={editor} className="myna-editor-canvas" />
        </div>

        {focusMode && (
          <button
            type="button"
            title={t.toolbar.exitFocusMode}
            onClick={() => setFocusMode(false)}
            className="no-drag fixed top-4 right-4 text-[12px] px-3 py-1.5 rounded-full bg-ink text-paper hover:bg-amber transition-colors print:hidden"
          >
            {t.toolbar.exitFocus}
          </button>
        )}
      </div>

      <div className="print:hidden shrink-0 px-5 py-1.5 border-t border-line/60 text-[11px] text-ink-soft/70 flex items-center justify-end gap-3 select-none">
        <span>{counts.words} {t.toolbar.wordsCount}</span>
        <span>{counts.characters} {t.toolbar.charactersCount}</span>
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
