import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attachment: {
      insertAttachment: (file: { name: string; size: number; dataUrl: string }) => ReturnType
    }
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return ""
  const units = ["B", "KB", "MB", "GB"]
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(1)} ${units[i]}`
}

export const Attachment = Node.create({
  name: "attachment",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      name: { default: "file" },
      size: { default: 0 },
      dataUrl: { default: "" },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="attachment"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "attachment", class: "attachment-card" })]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.className = "attachment-card"
      dom.contentEditable = "false"

      const icon = document.createElement("span")
      icon.textContent = "📎"
      icon.className = "attachment-icon"

      const info = document.createElement("div")
      info.className = "attachment-info"
      const name = document.createElement("div")
      name.className = "attachment-name"
      name.textContent = node.attrs.name
      const size = document.createElement("div")
      size.className = "attachment-size"
      size.textContent = formatBytes(node.attrs.size)
      info.append(name, size)

      const link = document.createElement("a")
      link.className = "attachment-download no-drag"
      link.href = node.attrs.dataUrl
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      if (node.attrs.dataUrl.startsWith("data:")) link.download = node.attrs.name
      link.textContent = "Open"
      link.addEventListener("click", (e) => e.stopPropagation())

      dom.append(icon, info, link)
      return { dom }
    }
  },

  addCommands() {
    return {
      insertAttachment:
        (file) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: file })
            .run(),
    }
  },
})
