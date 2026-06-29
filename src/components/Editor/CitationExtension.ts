import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    citation: {
      insertCitation: (citationId: string, label: string) => ReturnType
    }
  }
}

export const Citation = Node.create({
  name: "citation",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      citationId: { default: "" },
      label: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-label") ?? "",
        renderHTML: (attrs) => ({ "data-label": attrs.label }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="citation"]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "citation", class: "citation-ref", title: node.attrs.label }),
      `(${node.attrs.label})`,
    ]
  },

  addCommands() {
    return {
      insertCitation:
        (citationId, label) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { citationId, label } })
            .run(),
    }
  },
})
