import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    vocabulary: {
      insertVocabulary: () => ReturnType
    }
  }
}

export const Vocabulary = Node.create({
  name: "vocabulary",
  group: "block",
  content: "paragraph paragraph",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="vocabulary"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "vocabulary", class: "vocabulary-block" }), 0]
  },

  addCommands() {
    return {
      insertVocabulary:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Word" }] },
                { type: "paragraph", content: [{ type: "text", text: "Definition" }] },
              ],
            })
            .run(),
    }
  },
})
