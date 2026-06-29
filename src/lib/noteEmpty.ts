interface DocNode {
  text?: string
  content?: DocNode[]
}

function collectText(node: DocNode): string {
  let text = node.text ?? ""
  if (Array.isArray(node.content)) {
    for (const child of node.content) text += collectText(child)
  }
  return text
}

export function isNoteEmpty(note: { title: string; content: string }): boolean {
  if (note.title.trim()) return false
  const content = note.content.trim()
  if (!content) return true
  try {
    const json = JSON.parse(content) as DocNode
    return collectText(json).trim().length === 0
  } catch {
    return content.length === 0
  }
}
