import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggle: {
      insertToggle: () => ReturnType
    }
  }
}

export const Toggle = Node.create({
  name: "toggle",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (el) => el.getAttribute("data-open") !== "false",
        renderHTML: (attrs) => ({ "data-open": attrs.open ? "true" : "false" }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="toggle"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "toggle", class: "toggle-block" }), 0]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div")
      dom.className = "toggle-block"
      dom.dataset.open = node.attrs.open ? "true" : "false"

      const button = document.createElement("button")
      button.type = "button"
      button.className = "toggle-button no-drag"
      button.contentEditable = "false"
      button.textContent = node.attrs.open ? "▾" : "▸"
      button.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        const pos = getPos()
        editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, { open: !node.attrs.open }))
      })

      const content = document.createElement("div")
      content.className = "toggle-content"

      dom.append(button, content)

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false
          dom.dataset.open = updatedNode.attrs.open ? "true" : "false"
          button.textContent = updatedNode.attrs.open ? "▾" : "▸"
          return true
        },
      }
    }
  },

  addCommands() {
    return {
      insertToggle:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { open: true },
              content: [{ type: "paragraph", content: [{ type: "text", text: "Toggle details…" }] }],
            })
            .run(),
    }
  },
})
