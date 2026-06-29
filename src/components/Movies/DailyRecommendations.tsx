import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Sparkles, Plus, Clapperboard } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { generateDailyMovieRecommendations } from "../../lib/movieAi"
import type { MovieRecommendation } from "../../types"

const PALETTE = ["from-amber/40 to-amber/10", "from-blue/40 to-blue/10", "from-sage/40 to-sage/10", "from-rose/40 to-rose/10", "from-ink/30 to-ink/5"]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function DailyRecommendations() {
  const { t } = useI18n()
  const movies = useAppStore((s) => s.movies)
  const omdbApiKey = useAppStore((s) => s.settings.omdbApiKey)
  const recommendations = useAppStore((s) => s.movieRecommendations)
  const setMovieRecommendations = useAppStore((s) => s.setMovieRecommendations)
  const addMovie = useAppStore((s) => s.addMovie)
  const [loading, setLoading] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    const today = todayKey()
    if (recommendations?.date === today || fetchedRef.current) return
    fetchedRef.current = true
    setLoading(true)
    const watched = movies.filter((m) => m.status === "watched").map((m) => m.title)
    const wishlist = movies.filter((m) => m.status === "wishlist").map((m) => m.title)

    generateDailyMovieRecommendations(watched, wishlist).then(async (res) => {
      if ("error" in res) {
        setLoading(false)
        return
      }
      let items = res.items
      if (omdbApiKey) {
        items = await Promise.all(
          items.map(async (item) => {
            const search = await window.myna.movies.search({ apiKey: omdbApiKey, query: item.title })
            const match = search.results?.[0]
            return match ? { ...item, poster: match.poster, year: item.year ?? match.year } : item
          })
        )
      }
      setMovieRecommendations({ date: today, items })
      setLoading(false)
    })
  }, [recommendations?.date, movies, omdbApiKey, setMovieRecommendations])

  useEffect(() => {
    if (!rowRef.current || !recommendations?.items.length) return
    gsap.fromTo(rowRef.current.children, { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.07, ease: "back.out(1.5)" })
  }, [recommendations?.items])

  if (!loading && !recommendations?.items.length) return null

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={15} className="text-amber" />
        <h2 className="text-[16px] font-semibold text-ink">{t.movies.dailyPicksTitle}</h2>
      </div>
      <p className="text-[13px] text-ink-soft mb-4">{t.movies.dailyPicksHint}</p>

      {loading && !recommendations?.items.length ? (
        <div className="flex gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-36 lg:w-40 aspect-[2/3] rounded-2xl bg-black/5 animate-pulse shrink-0" />
          ))}
        </div>
      ) : (
        <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-thin pb-1">
          {recommendations?.items.map((item, i) => (
            <RecommendationCard
              key={item.title + i}
              item={item}
              index={i}
              onAdd={() => addMovie({ title: item.title, status: "wishlist", priority: "medium", poster: item.poster, genre: item.genre })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RecommendationCard({ item, index, onAdd }: { item: MovieRecommendation; index: number; onAdd: () => void }) {
  const { t } = useI18n()
  return (
    <div className="group relative w-36 lg:w-40 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 border border-line/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {item.poster ? (
        <img src={item.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${PALETTE[index % PALETTE.length]} grid place-items-center`}>
          <Clapperboard size={26} className="text-ink-soft/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      {item.genre && (
        <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{item.genre.split(",")[0]}</span>
      )}
      <button
        type="button"
        title={t.movies.addToWishlist}
        onClick={onAdd}
        className="no-drag absolute top-2 right-2 w-6 h-6 rounded-full bg-white/15 text-white grid place-items-center opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-opacity backdrop-blur-sm"
      >
        <Plus size={13} />
      </button>
      <div className="absolute bottom-0 inset-x-0 p-3">
        <div className="text-[13px] font-semibold text-white leading-snug mb-1 line-clamp-2">{item.title}</div>
        <p className="text-[11px] text-white/75 leading-snug line-clamp-2">{item.reason}</p>
      </div>
    </div>
  )
}
