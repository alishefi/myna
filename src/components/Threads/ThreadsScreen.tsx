import { useMemo, useState } from "react"
import clsx from "clsx"
import { Feather, Heart, ImageDown, MessageCircle, MoreHorizontal, Repeat2, Send, Trash2, X } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { useGsapEntrance } from "../../lib/useGsapEntrance"
import { relativeShort } from "../../lib/relativeTime"
import { exportThreadPostAsImage } from "../../lib/exportThreadImage"
import type { ThreadPost } from "../../types"

const MAX_LEN = 280

function Composer({
  placeholder,
  submitLabel,
  autoFocus,
  compact,
  onSubmit,
}: {
  placeholder: string
  submitLabel?: string
  autoFocus?: boolean
  compact?: boolean
  onSubmit: (text: string) => void
}) {
  const { t, lang } = useI18n()
  const [text, setText] = useState("")
  const remaining = MAX_LEN - text.length

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText("")
  }

  return (
    <div className={clsx("rounded-2xl border border-line/60 bg-paper-raised", compact ? "p-3.5" : "p-5")}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
        placeholder={placeholder}
        dir={text.trim() ? "auto" : lang === "da" ? "rtl" : "ltr"}
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        className={clsx(
          "w-full bg-transparent outline-none text-ink leading-relaxed resize-none placeholder:text-ink-soft/45",
          compact ? "text-[14px]" : "text-[16px]"
        )}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit()
        }}
      />
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-line/50">
        <span className={clsx("text-[11px] tabular-nums", remaining < 20 ? "text-rose" : "text-ink-soft/50")}>
          {t.threads.charsRemaining.replace("{n}", String(remaining))}
        </span>
        {compact ? (
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            title={submitLabel ?? t.threads.reply}
            className="no-drag w-8 h-8 rounded-full bg-ink text-paper grid place-items-center disabled:opacity-30 hover:bg-amber transition-colors"
          >
            <Send size={14} className="rtl:-scale-x-100" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="no-drag bg-ink text-paper px-5 py-2 rounded-full text-[13px] font-medium disabled:opacity-30 hover:bg-amber transition-colors"
          >
            {submitLabel ?? t.threads.post}
          </button>
        )}
      </div>
    </div>
  )
}

function PostCard({
  post,
  replyCount,
  reposted,
  onOpen,
  onDelete,
}: {
  post: ThreadPost
  replyCount: number
  reposted: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const { t, lang } = useI18n()
  const toggleLike = useAppStore((s) => s.toggleThreadPostLike)
  const repostThreadPost = useAppStore((s) => s.repostThreadPost)
  const deleteThreadPost = useAppStore((s) => s.deleteThreadPost)
  const threadPosts = useAppStore((s) => s.threadPosts)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleRepost = () => {
    const rootId = post.repostOf ?? post.id
    const existing = threadPosts.find((p) => p.repostOf === rootId)
    if (existing) deleteThreadPost(existing.id)
    else repostThreadPost(rootId)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="no-drag group rounded-2xl border border-line/60 bg-paper-raised p-5 hover:border-line hover:shadow-md transition-all cursor-pointer"
    >
      {post.repostOf && (
        <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft/60 mb-3">
          <Repeat2 size={12} />
          {t.threads.repostedByYou}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-soft grid place-items-center shrink-0">
            <Feather size={13} className="text-amber" />
          </div>
          <span className="text-[12px] text-ink-soft/70">{relativeShort(post.createdAt, lang)}</span>
        </div>
        <div className="relative">
          <button
            type="button"
            title={t.threads.delete}
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="no-drag w-7 h-7 rounded-full grid place-items-center text-ink-soft/50 opacity-0 group-hover:opacity-100 hover:bg-black/5 hover:text-ink transition-all"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute end-0 top-full mt-1 w-36 bg-paper-raised border border-line rounded-xl shadow-lg z-10 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
                className="no-drag w-full flex items-center gap-2 text-start text-[12.5px] font-medium px-3 py-2.5 hover:bg-black/5 text-rose"
              >
                <Trash2 size={13} />
                {t.threads.delete}
              </button>
            </div>
          )}
        </div>
      </div>

      <p dir="auto" className="text-[15.5px] text-ink leading-relaxed whitespace-pre-wrap mb-4">
        {post.text}
      </p>

      <div className="flex items-center gap-5">
        <button
          type="button"
          title={t.threads.like}
          onClick={(e) => {
            e.stopPropagation()
            toggleLike(post.id)
          }}
          className={clsx("no-drag flex items-center gap-1.5 text-[12.5px] transition-colors", post.liked ? "text-rose" : "text-ink-soft/60 hover:text-rose")}
        >
          <Heart size={15} className={clsx(post.liked && "fill-rose")} />
        </button>
        <button
          type="button"
          title={t.threads.reply}
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="no-drag flex items-center gap-1.5 text-[12.5px] text-ink-soft/60 hover:text-ink transition-colors"
        >
          <MessageCircle size={15} />
          {replyCount > 0 && <span className="tabular-nums">{replyCount}</span>}
        </button>
        <button
          type="button"
          title={t.threads.repost}
          onClick={(e) => {
            e.stopPropagation()
            toggleRepost()
          }}
          className={clsx("no-drag flex items-center gap-1.5 text-[12.5px] transition-colors", reposted ? "text-sage" : "text-ink-soft/60 hover:text-sage")}
        >
          <Repeat2 size={15} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            exportThreadPostAsImage(post.text, t.appName, lang, post.liked)
          }}
          title={t.threads.saveAsImage}
          className="no-drag flex items-center gap-1.5 text-[12.5px] text-ink-soft/60 hover:text-ink transition-colors"
        >
          <ImageDown size={15} />
        </button>
      </div>
    </div>
  )
}

export function ThreadsScreen() {
  const { t, lang } = useI18n()
  const threadPosts = useAppStore((s) => s.threadPosts)
  const createThreadPost = useAppStore((s) => s.createThreadPost)
  const deleteThreadPost = useAppStore((s) => s.deleteThreadPost)
  const toggleLike = useAppStore((s) => s.toggleThreadPostLike)
  const repostThreadPost = useAppStore((s) => s.repostThreadPost)
  const ref = useGsapEntrance()
  const [openPostId, setOpenPostId] = useState<string | null>(null)

  const topLevel = useMemo(
    () => threadPosts.filter((p) => !p.parentId).sort((a, b) => b.createdAt - a.createdAt),
    [threadPosts]
  )
  const replyCount = (id: string) => threadPosts.filter((p) => p.parentId === id).length
  const isReposted = (post: ThreadPost) => {
    const rootId = post.repostOf ?? post.id
    return threadPosts.some((p) => p.repostOf === rootId)
  }

  const openPost = threadPosts.find((p) => p.id === openPostId)
  const openReplies = useMemo(
    () => (openPost ? threadPosts.filter((p) => p.parentId === openPost.id).sort((a, b) => a.createdAt - b.createdAt) : []),
    [threadPosts, openPost]
  )

  const toggleRepost = (post: ThreadPost) => {
    const rootId = post.repostOf ?? post.id
    const existing = threadPosts.find((p) => p.repostOf === rootId)
    if (existing) deleteThreadPost(existing.id)
    else repostThreadPost(rootId)
  }

  return (
    <div ref={ref} className="p-12 pt-16 w-full flex flex-col items-center">
      <div className="w-full max-w-[620px] text-center mb-9">
        <div className="w-11 h-11 rounded-full bg-blue-soft grid place-items-center mx-auto mb-4">
          <MessageCircle size={18} className="text-blue" />
        </div>
        <h1 className="font-serif text-[38px] font-medium text-ink tracking-tight leading-tight">{t.threads.title}</h1>
        <p className="text-[15px] text-ink-soft mt-2">{t.threads.subtitle}</p>
      </div>

      <div className="w-full max-w-[620px] mb-8">
        <Composer placeholder={t.threads.placeholder} submitLabel={t.threads.post} onSubmit={(text) => createThreadPost(text)} />
      </div>

      <div className="w-full max-w-[620px] flex flex-col gap-4 pb-10">
        {topLevel.length === 0 ? (
          <div className="text-center py-16 text-ink-soft text-[14px] rounded-2xl border border-dashed border-line/70">{t.threads.empty}</div>
        ) : (
          topLevel.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              replyCount={replyCount(post.id)}
              reposted={isReposted(post)}
              onOpen={() => setOpenPostId(post.id)}
              onDelete={() => deleteThreadPost(post.id)}
            />
          ))
        )}
      </div>

      {openPost && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setOpenPostId(null)}
        >
          <div
            className="no-drag w-full max-w-[560px] max-h-[85vh] overflow-y-auto scrollbar-thin bg-paper-raised rounded-2xl border border-line shadow-xl p-7 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenPostId(null)}
              title={t.editor.back}
              className="no-drag absolute top-4 end-4 text-ink-soft/60 hover:text-ink"
            >
              <X size={17} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-amber-soft grid place-items-center shrink-0">
                <Feather size={14} className="text-amber" />
              </div>
              <span className="text-[12.5px] text-ink-soft/70">{relativeShort(openPost.createdAt, lang)}</span>
            </div>

            <p dir="auto" className="text-[19px] font-serif text-ink leading-relaxed whitespace-pre-wrap mb-5">
              {openPost.text}
            </p>

            <div className="flex items-center gap-5 pb-5 mb-5 border-b border-line/60">
              <button
                type="button"
                title={t.threads.like}
                onClick={() => toggleLike(openPost.id)}
                className={clsx("no-drag flex items-center gap-1.5 text-[13px] transition-colors", openPost.liked ? "text-rose" : "text-ink-soft/60 hover:text-rose")}
              >
                <Heart size={16} className={clsx(openPost.liked && "fill-rose")} />
              </button>
              <button
                type="button"
                title={t.threads.repost}
                onClick={() => toggleRepost(openPost)}
                className={clsx(
                  "no-drag flex items-center gap-1.5 text-[13px] transition-colors",
                  isReposted(openPost) ? "text-sage" : "text-ink-soft/60 hover:text-sage"
                )}
              >
                <Repeat2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => exportThreadPostAsImage(openPost.text, t.appName, lang, openPost.liked)}
                className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft/60 hover:text-ink transition-colors"
              >
                <ImageDown size={16} />
                {t.threads.saveAsImage}
              </button>
              <button
                type="button"
                title={t.threads.delete}
                onClick={() => {
                  deleteThreadPost(openPost.id)
                  setOpenPostId(null)
                }}
                className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft/60 hover:text-rose transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft/60 mb-3">
              {t.threads.replies} {openReplies.length > 0 && `(${openReplies.length})`}
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {openReplies.length === 0 ? (
                <div className="text-[13px] text-ink-soft/70">{t.threads.noReplies}</div>
              ) : (
                openReplies.map((reply) => (
                  <div key={reply.id} className="rounded-xl border border-line/60 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11.5px] text-ink-soft/60">{relativeShort(reply.createdAt, lang)}</span>
                      <button
                        type="button"
                        title={t.threads.delete}
                        onClick={() => deleteThreadPost(reply.id)}
                        className="no-drag text-ink-soft/40 hover:text-rose"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p dir="auto" className="text-[13.5px] text-ink leading-relaxed whitespace-pre-wrap mb-2">
                      {reply.text}
                    </p>
                    <button
                      type="button"
                      title={t.threads.like}
                      onClick={() => toggleLike(reply.id)}
                      className={clsx("no-drag flex items-center gap-1.5 text-[12px] transition-colors", reply.liked ? "text-rose" : "text-ink-soft/50 hover:text-rose")}
                    >
                      <Heart size={13} className={clsx(reply.liked && "fill-rose")} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <Composer
              placeholder={t.threads.replyPlaceholder}
              compact
              onSubmit={(text) => createThreadPost(text, openPost.id)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
