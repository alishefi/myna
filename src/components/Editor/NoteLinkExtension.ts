import { Node, mergeAttributes } from "@tiptap/core"
import { useUiStore } from "../../store/uiStore"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    noteLink: {
      insertNoteLink: (noteId: string, title: string) => ReturnType
    }
  }
}

export const NoteLink = Node.create({
  name: "noteLink",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      noteId: { default: "" },
      title: {
        default: "Untitled note",
        parseHTML: (el) => el.getAttribute("data-title") ?? "",
        renderHTML: (attrs) => ({ "data-title": attrs.title }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="note-link"]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "note-link", class: "note-link-chip" }), `📄 ${node.attrs.title}`]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span")
      dom.className = "note-link-chip"
      dom.contentEditable = "false"
      dom.textContent = `📄 ${node.attrs.title}`
      dom.addEventListener("click", () => {
        useUiStore.getState().openEditor(node.attrs.noteId)
      })
      return { dom }
    }
  },

  addCommands() {
    return {
      insertNoteLink:
        (noteId, title) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { noteId, title } })
            .run(),
    }
  },
})
