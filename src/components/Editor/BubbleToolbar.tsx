import { useState } from "react"
import { BubbleMenu, type Editor } from "@tiptap/react"
import clsx from "clsx"
import { Bold, Highlighter, Italic, Link2, Loader2, SpellCheck2, UnderlineIcon, Wand2 } from "lucide-react"
import { useI18n } from "../../i18n"
import { runAi } from "../../lib/ai"

const swatches = ["#1b1c1e", "#e8833f", "#4f7cff", "#7c9885", "#d97a86"]

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")
}

function BtnIcon({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx(
        "no-drag h-7 w-7 grid place-items-center rounded-md transition-colors",
        active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  )
}

export function BubbleToolbar({ editor }: { editor: Editor | null }) {
  const { t } = useI18n()
  const [loading, setLoading] = useState<"rewrite" | "grammar" | null>(null)
  const [errored, setErrored] = useState<"rewrite" | "grammar" | null>(null)

  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt(t.toolbar.linkUrlPrompt, prev ?? "https://")
    if (url === null) return
    if (!url) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const runOnSelection = async (action: "rewrite" | "grammar") => {
    const { from, to } = editor.state.selection
    if (from === to) return
    const text = editor.state.doc.textBetween(from, to, "\n")
    setLoading(action)
    setErrored(null)
    const res = await runAi(action === "rewrite" ? "rewrite" : "grammar", text)
    setLoading(null)
    if (res.error || !res.text) {
      setErrored(action)
      setTimeout(() => setErrored(null), 1800)
      return
    }
    editor.chain().focus().insertContentAt({ from, to }, `<p>${escapeHtml(res.text)}</p>`).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120 }}
      shouldShow={({ state }) => !state.selection.empty}
    >
      <div className="no-drag flex items-center gap-0.5 bg-[#1b1c1e] rounded-xl px-1.5 py-1.5 shadow-xl">
        <BtnIcon
          title={errored === "rewrite" ? t.toolbar.somethingWrong : t.toolbar.rewriteWithAi}
          active={loading === "rewrite"}
          onClick={() => runOnSelection("rewrite")}
        >
          {loading === "rewrite" ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} className={clsx(errored === "rewrite" && "text-rose")} />}
        </BtnIcon>
        <BtnIcon
          title={errored === "grammar" ? t.toolbar.somethingWrong : t.toolbar.checkGrammarWithAi}
          active={loading === "grammar"}
          onClick={() => runOnSelection("grammar")}
        >
          {loading === "grammar" ? <Loader2 size={14} className="animate-spin" /> : <SpellCheck2 size={14} className={clsx(errored === "grammar" && "text-rose")} />}
        </BtnIcon>

        <div className="w-px h-5 bg-white/15 mx-1" />

        <BtnIcon title={t.toolbar.bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </BtnIcon>
        <BtnIcon title={t.toolbar.italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </BtnIcon>
        <BtnIcon title={t.toolbar.underline} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </BtnIcon>
        <BtnIcon title={t.toolbar.highlight} active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#f6d9bf" }).run()}>
          <Highlighter size={14} />
        </BtnIcon>

        <div className="w-px h-5 bg-white/15 mx-1" />

        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            title={t.toolbar.textColorSwatch.replace("{color}", c)}
            onClick={() => editor.chain().focus().setColor(c).run()}
            className="w-4 h-4 rounded-full border border-white/30 shrink-0"
            style={{ background: c }}
          />
        ))}

        <div className="w-px h-5 bg-white/15 mx-1" />

        <BtnIcon title={t.toolbar.link} active={editor.isActive("link")} onClick={setLink}>
          <Link2 size={14} />
        </BtnIcon>
      </div>
    </BubbleMenu>
  )
}
