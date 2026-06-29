import { useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import clsx from "clsx"
import { format } from "date-fns"
import { Clapperboard, ImageUp, Plus, Search, Star, Trash2, X } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import type { Movie, MoviePriority, MovieSearchResult } from "../../types"
import { DailyRecommendations } from "./DailyRecommendations"

type Tab = "watched" | "wishlist"

const priorityClasses: Record<MoviePriority, string> = {
  low: "bg-sage/15 text-sage",
  medium: "bg-amber-soft text-amber",
  high: "bg-rose/15 text-rose",
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function PosterUploadOverlay({ onPick }: { onPick: (dataUrl: string) => void }) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <button
        type="button"
        title={t.movies.uploadPoster}
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
        className="no-drag absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/35 text-white opacity-0 hover:opacity-100 transition-all"
      >
        <ImageUp size={20} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        title={t.movies.uploadPoster}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const dataUrl = await readFileAsDataUrl(file)
          onPick(dataUrl)
          e.target.value = ""
        }}
      />
    </>
  )
}

export function MoviesScreen() {
  const { t } = useI18n()
  const movies = useAppStore((s) => s.movies)
  const addMovie = useAppStore((s) => s.addMovie)
  const deleteMovie = useAppStore((s) => s.deleteMovie)

  const [tab, setTab] = useState<Tab>("watched")
  const [modalOpen, setModalOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const watched = useMemo(() => movies.filter((m) => m.status === "watched").sort((a, b) => b.createdAt - a.createdAt), [movies])
  const wishlist = useMemo(() => movies.filter((m) => m.status === "wishlist").sort((a, b) => b.createdAt - a.createdAt), [movies])

  useEffect(() => {
    if (!gridRef.current) return
    gsap.fromTo(
      gridRef.current.children,
      { opacity: 0, y: 18, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" }
    )
  }, [tab, movies.length])

  const list = tab === "watched" ? watched : wishlist

  return (
    <div className="p-10 lg:p-12 w-full">
      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <h1 className="font-serif text-[34px] lg:text-[40px] font-medium text-ink leading-[1.1] mb-2">{t.movies.title}</h1>
          <p className="text-[15px] text-ink-soft">{t.movies.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="no-drag inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full text-[14px] font-medium hover:bg-amber transition-colors"
        >
          <Plus size={16} />
          {tab === "watched" ? t.movies.addMovie : t.movies.addToWishlist}
        </button>
      </div>

      <DailyRecommendations />

      <div className="flex gap-1.5 mb-9 bg-black/4 rounded-full p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("watched")}
          className={clsx(
            "no-drag flex items-center gap-2 text-[13.5px] font-medium px-5 py-2 rounded-full transition-colors",
            tab === "watched" ? "bg-paper-raised text-ink border border-line" : "text-ink-soft"
          )}
        >
          {t.movies.watched}
        </button>
        <button
          type="button"
          onClick={() => setTab("wishlist")}
          className={clsx(
            "no-drag flex items-center gap-2 text-[13.5px] font-medium px-5 py-2 rounded-full transition-colors",
            tab === "wishlist" ? "bg-paper-raised text-ink border border-line" : "text-ink-soft"
          )}
        >
          {t.movies.wishlist}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 text-ink-soft text-[15px]">{t.movies.empty}</div>
      ) : tab === "watched" ? (
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {watched.map((m) => (
            <WatchedCard key={m.id} movie={m} onDelete={() => deleteMovie(m.id)} />
          ))}
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {wishlist.map((m) => (
            <WishlistCard key={m.id} movie={m} onDelete={() => deleteMovie(m.id)} />
          ))}
        </div>
      )}

      {modalOpen && (
        <AddMovieModal
          mode={tab}
          onClose={() => setModalOpen(false)}
          onSubmit={(data) => {
            addMovie(data)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function WatchedCard({ movie, onDelete }: { movie: Movie; onDelete: () => void }) {
  const { t } = useI18n()
  const updateMovie = useAppStore((s) => s.updateMovie)
  return (
    <div className="no-drag group relative rounded-2xl border border-line/60 bg-paper-raised p-6 hover:border-ink/15 hover:shadow-md transition-all">
      <button
        type="button"
        title={t.editor.delete}
        onClick={onDelete}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose transition-opacity"
      >
        <Trash2 size={15} />
      </button>
      <div className="flex gap-4 mb-3">
        <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-line/50 bg-black/5">
          {movie.poster ? (
            <img src={movie.poster} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <Clapperboard size={18} className="text-ink-soft/40" />
            </div>
          )}
          <PosterUploadOverlay onPick={(dataUrl) => updateMovie(movie.id, { poster: dataUrl })} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[18px] font-semibold text-ink mb-1.5 pr-6">{movie.title}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={15} className={n <= (movie.rating ?? 0) ? "fill-amber text-amber" : "text-ink-soft/30"} />
            ))}
            {movie.imdbRating != null && (
              <span className="text-[11.5px] text-ink-soft ml-1.5">IMDb {movie.imdbRating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
      {movie.review && <p className="text-[14px] text-ink-soft leading-relaxed mb-4">{movie.review}</p>}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(movie.tags ?? []).map((tag) => (
            <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-black/5 text-ink-soft">
              {tag}
            </span>
          ))}
        </div>
        {movie.dateWatched && <div className="text-[12px] text-ink-soft shrink-0">{format(new Date(movie.dateWatched), "MMM d, yyyy")}</div>}
      </div>
    </div>
  )
}

function WishlistCard({ movie, onDelete }: { movie: Movie; onDelete: () => void }) {
  const { t } = useI18n()
  const updateMovie = useAppStore((s) => s.updateMovie)
  return (
    <div className="no-drag group relative rounded-2xl border border-line/60 bg-paper-raised p-4 hover:border-ink/15 hover:shadow-md transition-all">
      <button
        type="button"
        title={t.editor.delete}
        onClick={onDelete}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose transition-opacity z-10"
      >
        <Trash2 size={13} />
      </button>
      <div className="relative w-full aspect-[2/3] rounded-xl bg-black/5 grid place-items-center mb-3 overflow-hidden">
        {movie.poster ? (
          <img src={movie.poster} alt="" className="w-full h-full object-cover" />
        ) : (
          <Clapperboard size={26} className="text-ink-soft/40" />
        )}
        <PosterUploadOverlay onPick={(dataUrl) => updateMovie(movie.id, { poster: dataUrl })} />
      </div>
      <div className="text-[13.5px] font-medium text-ink leading-snug mb-2">{movie.title}</div>
      {movie.priority && (
        <span className={clsx("text-[11px] font-medium px-2.5 py-1 rounded-full", priorityClasses[movie.priority])}>
          {movie.priority === "low" ? t.movies.priorityLow : movie.priority === "medium" ? t.movies.priorityMedium : t.movies.priorityHigh}
        </span>
      )}
    </div>
  )
}

function AddMovieModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: Tab
  onClose: () => void
  onSubmit: (data: Omit<Movie, "id" | "createdAt">) => void
}) {
  const { t } = useI18n()
  const omdbApiKey = useAppStore((s) => s.settings.omdbApiKey)
  const [title, setTitle] = useState("")
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [tags, setTags] = useState("")
  const [priority, setPriority] = useState<MoviePriority>("medium")
  const [results, setResults] = useState<MovieSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<{ imdbID: string; poster?: string; imdbRating?: number; plot?: string; genre?: string } | null>(null)
  const [manualPoster, setManualPoster] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const posterInputRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)" })
    }
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  const onTitleChange = (value: string) => {
    setTitle(value)
    setSelected(null)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!omdbApiKey || value.trim().length < 2) {
      setResults([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const res = await window.myna.movies.search({ apiKey: omdbApiKey, query: value.trim() })
      setSearching(false)
      setResults(res.results ?? [])
    }, 400)
  }

  const pickResult = async (r: MovieSearchResult) => {
    setTitle(r.title)
    setResults([])
    const res = await window.myna.movies.lookup({ apiKey: omdbApiKey, imdbID: r.imdbID })
    if (res.movie) {
      setSelected({
        imdbID: res.movie.imdbID,
        poster: res.movie.poster,
        imdbRating: res.movie.imdbRating,
        plot: res.movie.plot,
        genre: res.movie.genre,
      })
      if (mode === "watched" && res.movie.plot && !review) setReview(res.movie.plot)
      if (res.movie.genre && !tags) setTags(res.movie.genre)
    }
  }

  const submit = () => {
    if (!title.trim()) return
    if (mode === "watched") {
      onSubmit({
        title: title.trim(),
        status: "watched",
        rating: rating || undefined,
        review: review.trim() || undefined,
        tags: tags.trim() ? tags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        dateWatched: new Date().toISOString().slice(0, 10),
        imdbID: selected?.imdbID,
        poster: manualPoster ?? selected?.poster,
        imdbRating: selected?.imdbRating,
        plot: selected?.plot,
        genre: selected?.genre,
      })
    } else {
      onSubmit({
        title: title.trim(),
        status: "wishlist",
        priority,
        imdbID: selected?.imdbID,
        poster: manualPoster ?? selected?.poster,
        imdbRating: selected?.imdbRating,
        plot: selected?.plot,
        genre: selected?.genre,
      })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-10 z-50 bg-paper/75 backdrop-blur-sm flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={modalRef} className="bg-paper-raised rounded-3xl shadow-2xl w-full max-w-[480px] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[19px] font-semibold text-ink">{mode === "watched" ? t.movies.modalTitleWatched : t.movies.modalTitleWishlist}</div>
          <button type="button" title={t.common.close} onClick={onClose} className="no-drag text-ink-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <label className="text-[12.5px] font-medium text-ink-soft block mb-1.5">{t.movies.fieldTitle}</label>
        <div className="relative mb-5">
          <div className="relative">
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              autoFocus
              placeholder={omdbApiKey ? t.movies.searchTitlePlaceholder : undefined}
              className="w-full bg-paper border border-line rounded-xl pl-10 pr-4 py-2.5 text-[15px] outline-none focus:border-ink/30"
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          </div>
          {results.length > 0 && (
            <div className="absolute top-full inset-x-0 mt-1.5 bg-paper-raised border border-line rounded-xl shadow-lg max-h-60 overflow-y-auto scrollbar-thin z-10">
              {results.map((r) => (
                <button
                  key={r.imdbID}
                  type="button"
                  onClick={() => pickResult(r)}
                  className="no-drag w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 text-left"
                >
                  {r.poster ? (
                    <img src={r.poster} alt="" className="w-7 h-10 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-10 rounded bg-black/5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-ink truncate">{r.title}</div>
                    <div className="text-[11.5px] text-ink-soft">{r.year}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searching && <div className="text-[12px] text-ink-soft mt-1.5">{t.movies.searching}</div>}

          <div className="flex items-center gap-3 mt-3">
            <div className="relative w-10 h-14 rounded-lg overflow-hidden border border-line/60 bg-black/5 shrink-0">
              {(manualPoster ?? selected?.poster) ? (
                <img src={manualPoster ?? selected?.poster} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <Clapperboard size={15} className="text-ink-soft/40" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="no-drag inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink border border-line rounded-full px-3.5 py-2"
            >
              <ImageUp size={13} />
              {t.movies.uploadPoster}
            </button>
            {selected?.imdbRating != null && <span className="text-[12px] text-ink-soft">IMDb {selected.imdbRating.toFixed(1)}</span>}
            <input
              ref={posterInputRef}
              type="file"
              accept="image/*"
              title={t.movies.uploadPoster}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setManualPoster(await readFileAsDataUrl(file))
                e.target.value = ""
              }}
            />
          </div>
        </div>

        {mode === "watched" ? (
          <>
            <label className="text-[12.5px] font-medium text-ink-soft block mb-1.5">{t.movies.fieldRating}</label>
            <div className="flex items-center gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="no-drag">
                  <Star size={22} className={n <= rating ? "fill-amber text-amber" : "text-ink-soft/30"} />
                </button>
              ))}
            </div>

            <label className="text-[12.5px] font-medium text-ink-soft block mb-1.5">{t.movies.fieldReview}</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="w-full bg-paper border border-line rounded-xl px-4 py-2.5 text-[14.5px] outline-none focus:border-ink/30 resize-none mb-5"
            />

            <label className="text-[12.5px] font-medium text-ink-soft block mb-1.5">{t.movies.fieldTags}</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comedy, cozy, with friends"
              className="w-full bg-paper border border-line rounded-xl px-4 py-2.5 text-[14.5px] outline-none focus:border-ink/30"
            />
            <p className="text-[12px] text-ink-soft mt-1.5 mb-1">{t.movies.fieldTagsHint}</p>
          </>
        ) : (
          <>
            <label className="text-[12.5px] font-medium text-ink-soft block mb-1.5">{t.movies.fieldPriority}</label>
            <div className="flex gap-2 mb-2">
              {(["low", "medium", "high"] as MoviePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={clsx(
                    "no-drag flex-1 text-[13px] font-medium px-3 py-2.5 rounded-xl border transition-colors",
                    priority === p ? "border-ink bg-black/5 text-ink" : "border-line text-ink-soft"
                  )}
                >
                  {p === "low" ? t.movies.priorityLow : p === "medium" ? t.movies.priorityMedium : t.movies.priorityHigh}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={submit}
          className="no-drag w-full mt-6 bg-ink text-paper py-3 rounded-full text-[14.5px] font-medium hover:bg-amber transition-colors"
        >
          {t.common.save}
        </button>
      </div>
    </div>
  )
}
