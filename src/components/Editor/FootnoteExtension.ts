import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    footnote: {
      insertFootnote: () => ReturnType
    }
  }
}

export interface FootnoteEntry {
  number: number
  text: string
  pos: number
}

export function extractFootnotes(doc: import("@tiptap/pm/model").Node): FootnoteEntry[] {
  const entries: FootnoteEntry[] = []
  doc.descendants((node, pos) => {
    if (node.type.name === "footnote") {
      entries.push({ number: entries.length + 1, text: node.attrs.text, pos })
    }
  })
  return entries
}

export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      text: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-text") ?? "",
        renderHTML: (attrs) => ({ "data-text": attrs.text }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'sup[data-type="footnote"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes, { "data-type": "footnote", class: "footnote-ref" })]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("sup")
      dom.className = "footnote-ref"
      dom.contentEditable = "false"

      const refresh = () => {
        const all = extractFootnotes(editor.state.doc)
        const pos = getPos()
        const entry = all.find((f) => f.pos === pos)
        dom.textContent = entry ? String(entry.number) : "*"
        dom.title = node.attrs.text
      }
      refresh()

      dom.addEventListener("click", () => {
        const next = window.prompt("Edit footnote", dom.dataset.text ?? node.attrs.text)
        if (next === null) return
        const pos = getPos()
        editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, { text: next }))
      })

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false
          dom.dataset.text = updatedNode.attrs.text
          dom.title = updatedNode.attrs.text
          refresh()
          return true
        },
      }
    }
  },

  addCommands() {
    return {
      insertFootnote:
        () =>
        ({ chain }) => {
          const text = window.prompt("Footnote text", "")
          if (!text || !text.trim()) return false
          return chain()
            .focus()
            .insertContent({ type: this.name, attrs: { text: text.trim() } })
            .run()
        },
    }
  },
})
