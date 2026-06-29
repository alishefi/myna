export interface DocBlock {
  type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet" | "ordered" | "quote" | "code" | "task"
  text: string
  checked?: boolean
}

interface PMNode {
  type: string
  text?: string
  attrs?: { level?: number; checked?: boolean }
  content?: PMNode[]
}

function textOf(node: PMNode): string {
  if (node.text) return node.text
  if (!node.content) return ""
  return node.content.map(textOf).join("")
}

export function parseTiptapJson(json: string): DocBlock[] {
  let doc: PMNode
  try {
    doc = JSON.parse(json)
  } catch {
    return [{ type: "paragraph", text: json }]
  }
  const blocks: DocBlock[] = []

  function visit(node: PMNode) {
    switch (node.type) {
      case "heading": {
        const level = node.attrs?.level ?? 1
        blocks.push({
          type: level === 1 ? "heading1" : level === 2 ? "heading2" : "heading3",
          text: textOf(node),
        })
        break
      }
      case "paragraph":
        blocks.push({ type: "paragraph", text: textOf(node) })
        break
      case "blockquote":
        node.content?.forEach((c) => blocks.push({ type: "quote", text: textOf(c) }))
        break
      case "codeBlock":
        blocks.push({ type: "code", text: textOf(node) })
        break
      case "bulletList":
        node.content?.forEach((li) => blocks.push({ type: "bullet", text: textOf(li) }))
        break
      case "orderedList":
        node.content?.forEach((li) => blocks.push({ type: "ordered", text: textOf(li) }))
        break
      case "taskList":
        node.content?.forEach((li) =>
          blocks.push({ type: "task", text: textOf(li), checked: !!li.attrs?.checked })
        )
        break
      case "table":
        node.content?.forEach((row) =>
          blocks.push({ type: "paragraph", text: row.content?.map(textOf).join("  |  ") ?? "" })
        )
        break
      default:
        if (node.content) node.content.forEach(visit)
    }
  }

  doc.content?.forEach(visit)
  return blocks
}

export function blocksToPlainText(blocks: DocBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "bullet") return `•  ${b.text}`
      if (b.type === "ordered") return `1. ${b.text}`
      if (b.type === "task") return `${b.checked ? "☑" : "☐"} ${b.text}`
      if (b.type === "quote") return `"${b.text}"`
      return b.text
    })
    .join("\n")
}
