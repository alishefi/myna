import { Node } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useRef, useState } from "react"
import { Mic, Square, Trash2 } from "lucide-react"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audioBlock: {
      insertAudioBlock: () => ReturnType
    }
  }
}

function AudioBlockView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { t } = useI18n()
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const reader = new FileReader()
        reader.onload = () => updateAttributes({ src: reader.result })
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch {
      useUiStore.getState().showAlert(t.toolbar.micAccessDenied)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <NodeViewWrapper className="audio-block" contentEditable={false}>
      {node.attrs.src ? (
        <div className="audio-block-player">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={node.attrs.src} />
          <button type="button" title={t.toolbar.removeRecording} onClick={() => deleteNode()} className="no-drag audio-block-remove">
            <Trash2 size={13} />
          </button>
        </div>
      ) : recording ? (
        <button type="button" onClick={stopRecording} className="no-drag audio-block-button audio-block-recording">
          <Square size={13} />
          {t.toolbar.stopRecording}
        </button>
      ) : (
        <button type="button" onClick={startRecording} className="no-drag audio-block-button">
          <Mic size={13} />
          {t.toolbar.recordAudio}
        </button>
      )}
    </NodeViewWrapper>
  )
}

export const AudioBlock = Node.create({
  name: "audioBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return { src: { default: "" } }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="audio-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-type": "audio-block" }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioBlockView)
  },

  addCommands() {
    return {
      insertAudioBlock:
        () =>
        ({ chain }) =>
          chain().focus().insertContent({ type: this.name }).run(),
    }
  },
})
