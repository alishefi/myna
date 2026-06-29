import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { getActiveEditor, getActiveNoteId } from "../../lib/activeEditor"
import { exportNoteAsDocx, exportNoteAsMyna, exportNoteAsPdf, exportNoteAsTxt, noteFromImportedJson } from "../../lib/exportNote"
import { runAi } from "../../lib/ai"
import { HelpModal, type HelpModalKind } from "./HelpModal"
import type { Note } from "../../types"

type MenuId = "file" | "edit" | "view" | "tools" | "help"

interface MenuItem {
  label?: string
  separator?: true
  onClick?: () => void
}

function activeNote(): Note | null {
  const id = getActiveNoteId()
  if (!id) return null
  return useAppStore.getState().notes.find((n) => n.id === id) ?? null
}

export function MenuBar() {
  const { t } = useI18n()
  const [open, setOpen] = useState<MenuId | null>(null)
  const [helpModal, setHelpModal] = useState<HelpModalKind | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const createNote = useAppStore((s) => s.createNote)
  const openEditor = useUiStore((s) => s.openEditor)
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const showAlert = useUiStore((s) => s.showAlert)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const run = (fn: () => void) => {
    fn()
    setOpen(null)
  }

  const requireNote = (action: (note: Note) => void) => {
    const note = activeNote()
    if (!note) {
      showAlert(t.menu.openNoteFirst)
      return
    }
    action(note)
  }

  const newNote = () => {
    const note = createNote({})
    openEditor(note.id)
  }

  const importNote = async () => {
    try {
      const result = await window.myna.menu.importNote()
      if (result.canceled) return
      if (result.error || !result.note) {
        showAlert(result.error ?? t.menu.importError)
        return
      }
      const note = noteFromImportedJson(result.note)
      if (!note) {
        showAlert(t.menu.invalidNoteFile)
        return
      }
      const created = createNote(note)
      openEditor(created.id)
    } catch (err) {
      showAlert(`${t.menu.importFailedPrefix} ${err instanceof Error ? err.message : "unknown error"}. ${t.menu.importFailedSuffix}`)
    }
  }

  const aiSummarize = async () => {
    const editor = getActiveEditor()
    if (!editor) {
      showAlert(t.menu.openNoteToSummarize)
      return
    }
    const text = editor.getText().trim()
    if (!text) {
      showAlert(t.menu.noteEmpty)
      return
    }
    const res = await runAi("summarize", text)
    if (res.error || !res.text) {
      showAlert(res.error || t.menu.aiSummaryFailed)
      return
    }
    editor.chain().focus("end").insertContent(`<p><strong>Summary:</strong> ${escapeHtml(res.text)}</p>`).run()
  }

  const menus: Record<MenuId, MenuItem[]> = {
    file: [
      { label: t.menu.newNote, onClick: newNote },
      { label: t.menu.newClass, onClick: () => setActiveModule("school") },
      { separator: true },
      { label: t.menu.saveAs, onClick: () => requireNote((n) => exportNoteAsMyna(n)) },
      { label: t.menu.importEllipsis, onClick: importNote },
      { separator: true },
      { label: t.editor.exportPdf, onClick: () => requireNote((n) => exportNoteAsPdf(n)) },
      { label: t.editor.exportDocx, onClick: () => requireNote((n) => exportNoteAsDocx(n)) },
      { label: t.menu.exportTxt, onClick: () => requireNote((n) => exportNoteAsTxt(n)) },
      { separator: true },
      { label: t.menu.print, onClick: () => window.print() },
    ],
    edit: [
      { label: t.menu.undo, onClick: () => getActiveEditor()?.commands.undo() },
      { label: t.menu.redo, onClick: () => getActiveEditor()?.commands.redo() },
      { separator: true },
      { label: t.menu.cut, onClick: () => window.myna.edit.cut() },
      { label: t.menu.copy, onClick: () => window.myna.edit.copy() },
      { label: t.menu.paste, onClick: () => window.myna.edit.paste() },
    ],
    view: [
      { label: t.menu.toggleSidebar, onClick: toggleSidebar },
      { separator: true },
      { label: t.menu.fullScreen, onClick: () => window.myna.win.toggleFullscreen() },
      { label: t.menu.zoomIn, onClick: () => window.myna.win.zoomIn() },
      { label: t.menu.zoomOut, onClick: () => window.myna.win.zoomOut() },
      { label: t.menu.resetZoom, onClick: () => window.myna.win.zoomReset() },
    ],
    tools: [
      { label: t.menu.aiSummaries, onClick: aiSummarize },
      { label: t.menu.flashcardGenerator, onClick: () => setActiveModule("school") },
      { label: t.menu.studyMode, onClick: () => setActiveModule("school") },
    ],
    help: [
      { label: t.menu.aboutMyna, onClick: () => setHelpModal("about") },
      { label: t.menu.keyboardShortcuts, onClick: () => setHelpModal("shortcuts") },
      { label: t.menu.support, onClick: () => setHelpModal("support") },
    ],
  }

  const labels: Record<MenuId, string> = {
    file: t.menu.file,
    edit: t.menu.edit,
    view: t.menu.view,
    tools: t.menu.tools,
    help: t.menu.help,
  }

  return (
    <div ref={rootRef} className="no-drag relative flex items-center h-full">
      {(Object.keys(menus) as MenuId[]).map((id) => (
        <div key={id} className="relative h-full">
          <button
            type="button"
            onClick={() => setOpen((v) => (v === id ? null : id))}
            className={clsx(
              "h-full px-3 text-[13px] transition-colors",
              open === id ? "bg-black/[0.06] text-ink" : "text-ink-soft hover:bg-black/[0.04] hover:text-ink"
            )}
          >
            {labels[id]}
          </button>
          {open === id && (
            <div className="absolute top-full left-0 mt-0.5 w-56 bg-paper-raised border border-ink/15 rounded-lg shadow-lg z-50 py-1">
              {menus[id].map((item, i) =>
                item.separator ? (
                  <div key={i} className="my-1 h-px bg-line/70" />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => item.onClick && run(item.onClick)}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-ink hover:bg-black/5 transition-colors"
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
      <HelpModal kind={helpModal} onClose={() => setHelpModal(null)} />
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")
}
