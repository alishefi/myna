import type { Editor } from "@tiptap/react"

let activeEditor: Editor | null = null
let activeNoteId: string | null = null

export function setActiveEditor(editor: Editor | null, noteId: string | null = null) {
  activeEditor = editor
  activeNoteId = editor ? noteId : null
}

export function getActiveEditor(): Editor | null {
  return activeEditor
}

export function getActiveNoteId(): string | null {
  return activeNoteId
}
