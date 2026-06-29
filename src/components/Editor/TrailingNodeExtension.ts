import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

export const TrailingNode = Extension.create({
  name: "trailingNode",

  addProseMirrorPlugins() {
    const key = new PluginKey(this.name)

    return [
      new Plugin({
        key,
        appendTransaction: (_transactions, _oldState, newState) => {
          const shouldAppend = key.getState(newState)
          if (!shouldAppend) return null
          const endPos = newState.doc.content.size
          return newState.tr.insert(endPos, newState.schema.nodes.paragraph.create())
        },
        state: {
          init: (_, state) => state.doc.lastChild?.type.name !== "paragraph",
          apply: (tr, value, _oldState, newState) => (tr.docChanged ? newState.doc.lastChild?.type.name !== "paragraph" : value),
        },
      }),
    ]
  },
})
