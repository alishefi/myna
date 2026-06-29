import { Node, mergeAttributes } from "@tiptap/core"
import katex from "katex"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      insertMathBlock: () => ReturnType
    }
  }
}

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  defining: true,

  addAttributes() {
    return {
      latex: {
        default: "E = mc^2",
        parseHTML: (el) => el.getAttribute("data-latex") ?? "",
        renderHTML: (attrs) => ({ "data-latex": attrs.latex }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "math-block", class: "math-block" })]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div")
      dom.className = "math-block"
      dom.contentEditable = "false"

      const render = (latex: string) => {
        try {
          dom.innerHTML = katex.renderToString(latex, { throwOnError: false, displayMode: true })
        } catch {
          dom.textContent = latex
        }
      }
      render(node.attrs.latex)

      dom.addEventListener("click", () => {
        const next = window.prompt("Edit LaTeX", dom.dataset.latex ?? node.attrs.latex)
        if (next === null) return
        const pos = getPos()
        editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, { latex: next }))
      })

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false
          dom.dataset.latex = updatedNode.attrs.latex
          render(updatedNode.attrs.latex)
          return true
        },
      }
    }
  },

  addCommands() {
    return {
      insertMathBlock:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: { latex: "E = mc^2" } })
            .run(),
    }
  },
})
