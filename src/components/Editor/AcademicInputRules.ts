import { Extension, InputRule, wrappingInputRule } from "@tiptap/core"

export const AcademicInputRules = Extension.create({
  name: "academicInputRules",

  addInputRules() {
    const calloutType = this.editor.schema.nodes.callout
    const rules = []

    if (calloutType) {
      rules.push(wrappingInputRule({ find: /^>>\s$/, type: calloutType }))
    }

    rules.push(
      new InputRule({
        find: /^===\s$/,
        handler: ({ chain, range }) => {
          chain().deleteRange(range).setHorizontalRule().run()
        },
      })
    )

    return rules
  },
})
