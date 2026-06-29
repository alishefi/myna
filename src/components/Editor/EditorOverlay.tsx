import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ArrowLeft } from "lucide-react"
import { useUiStore } from "../../store/uiStore"
import { useAppStore } from "../../store/appStore"
import { NoteEditor } from "./NoteEditor"
import { useI18n } from "../../i18n"
import { isNoteEmpty } from "../../lib/noteEmpty"
import { MenuBar } from "../shared/MenuBar"

export function EditorOverlay() {
  const editorOpen = useUiStore((s) => s.editorOpen)
  const editingNoteId = useUiStore((s) => s.editingNoteId)
  const closeEditor = useUiStore((s) => s.closeEditor)
  const note = useAppStore((s) => s.notes.find((n) => n.id === editingNoteId))
  const deleteNote = useAppStore((s) => s.deleteNote)
  const { t } = useI18n()

  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorOpen) {
      setMounted(true)
    } else if (mounted && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.96,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setMounted(false),
      })
    }
  }, [editorOpen, mounted])

  useEffect(() => {
    if (mounted && editorOpen && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, scale: 0.94, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
      )
    }
  }, [mounted, editorOpen])

  if (!mounted || !note) return null

  const handleDelete = () => {
    deleteNote(note.id)
    closeEditor()
  }

  const handleBack = () => {
    const current = useAppStore.getState().notes.find((n) => n.id === note.id)
    if (current && isNoteEmpty(current)) {
      deleteNote(note.id)
    } else {
      useAppStore.getState().saveNow()
    }
    closeEditor()
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-paper flex flex-col print:static print:z-auto">
      <div className="drag h-9 flex items-center gap-3 px-4 shrink-0 print:hidden border-b border-line/60">
        <button type="button" onClick={handleBack} className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink shrink-0">
          <ArrowLeft size={14} />
          {t.editor.back}
        </button>
        <div className="h-4 w-px bg-line/70 shrink-0" />
        <MenuBar />
      </div>
      <div className="flex-1 flex min-h-0">
        <NoteEditor note={note} onDelete={handleDelete} />
      </div>
    </div>
  )
}
