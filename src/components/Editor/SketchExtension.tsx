import { Node } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useEffect, useRef } from "react"
import { Eraser } from "lucide-react"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sketchBlock: {
      insertSketchBlock: () => ReturnType
    }
  }
}

function SketchBlockView({ node, updateAttributes }: NodeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (node.attrs.src) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = node.attrs.src
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    updateAttributes({ src: canvas.toDataURL("image/png") })
  }

  const point = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * canvas.width, y: ((e.clientY - rect.top) / rect.height) * canvas.height }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drawingRef.current = true
    lastPointRef.current = point(e)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !lastPointRef.current) return
    const p = point(e)
    ctx.strokeStyle = "#1b1c1e"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastPointRef.current = p
  }

  const onPointerUp = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPointRef.current = null
    save()
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    save()
  }

  return (
    <NodeViewWrapper className="sketch-block" contentEditable={false}>
      <canvas
        ref={canvasRef}
        width={520}
        height={280}
        className="sketch-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <button type="button" title="Clear sketch" onClick={clear} className="no-drag sketch-clear">
        <Eraser size={13} />
      </button>
    </NodeViewWrapper>
  )
}

export const SketchBlock = Node.create({
  name: "sketchBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return { src: { default: "" } }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="sketch-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-type": "sketch-block" }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SketchBlockView)
  },

  addCommands() {
    return {
      insertSketchBlock:
        () =>
        ({ chain }) =>
          chain().focus().insertContent({ type: this.name }).run(),
    }
  },
})
