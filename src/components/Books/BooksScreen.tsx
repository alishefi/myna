import { useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { BookOpen, Plus, Trash2 } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { tiptapWordCount } from "../../lib/bookEngine"
import { BookStartModal } from "./BookStartModal"

export function BooksScreen() {
  const { t } = useI18n()
  const projects = useAppStore((s) => s.bookProjects)
  const chapters = useAppStore((s) => s.bookChapters)
  const deleteBookProject = useAppStore((s) => s.deleteBookProject)
  const openBookProject = useUiStore((s) => s.openBookProject)
  const gridRef = useRef<HTMLDivElement>(null)
  const [startOpen, setStartOpen] = useState(false)

  const sorted = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects])

  useEffect(() => {
    if (!gridRef.current) return
    gsap.fromTo(gridRef.current.children, { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" })
  }, [sorted.length])

  const wordsFor = (projectId: string) => chapters.filter((c) => c.projectId === projectId).reduce((sum, c) => sum + tiptapWordCount(c.content), 0)

  return (
    <div className="p-10 lg:p-12 w-full max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <h1 className="font-serif text-[34px] lg:text-[40px] font-medium text-ink leading-[1.1] mb-2">{t.books.title}</h1>
          <p className="text-[15px] text-ink-soft">{t.books.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setStartOpen(true)}
          className="no-drag inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full text-[14px] font-medium hover:bg-amber transition-colors"
        >
          <Plus size={16} />
          {t.books.writeNewBook}
        </button>
      </div>

      {startOpen && <BookStartModal onClose={() => setStartOpen(false)} />}

      {sorted.length === 0 ? (
        <div className="text-center py-24 text-ink-soft text-[15px]">{t.books.empty}</div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((project) => {
            const chapterCount = chapters.filter((c) => c.projectId === project.id).length
            return (
              <div
                key={project.id}
                className="group relative rounded-2xl border border-line bg-paper-raised p-5 hover:border-ink/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => openBookProject(project.id)}
              >
                <button
                  type="button"
                  title={t.books.deleteBook}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBookProject(project.id)
                  }}
                  className="no-drag absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose transition-opacity"
                >
                  <Trash2 size={15} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-blue/10 grid place-items-center mb-4">
                  <BookOpen size={18} className="text-blue" />
                </div>
                <div className="text-[16px] font-semibold text-ink mb-1.5 truncate pr-6">{project.title || t.books.untitledBook}</div>
                <div className="text-[12.5px] text-ink-soft">
                  {chapterCount} {chapterCount === 1 ? t.books.chapter : t.books.chaptersPlural} · {wordsFor(project.id).toLocaleString()} {t.books.words}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
