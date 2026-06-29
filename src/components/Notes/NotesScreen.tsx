import { useEffect, useRef, useState } from "react"
import { Plus, Search, ChevronDown, Check } from "lucide-react"
import clsx from "clsx"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { ScreenHeader } from "../shared/ScreenHeader"
import { NoteListCard } from "./NoteListCard"
import { useGsapStagger } from "../../lib/useGsapStagger"
import { isNoteEmpty } from "../../lib/noteEmpty"
import type { Note } from "../../types"

const NON_NOTES_TAGS = ["daily-prompt", "template", "template-doc", "stream-writing"]
type Tab = "all" | "pinned"
type StatusFilter = "all" | "notes" | "drafts"
type Sort = "updated" | "created" | "title"

export function NotesScreen() {
  const allNotes = useAppStore((s) => s.notes)
  const createNote = useAppStore((s) => s.createNote)
  const openEditor = useUiStore((s) => s.openEditor)
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<Sort>("updated")
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const ref = useGsapStagger()

  useEffect(() => {
    if (!sortOpen) return
    const onClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [sortOpen])

  const notes = allNotes.filter((n) => !n.classId && !n.tags.some((tag) => NON_NOTES_TAGS.includes(tag)))

  const drafts = notes.filter((n) => isNoteEmpty(n))
  const realNotes = notes.filter((n) => !isNoteEmpty(n))
  const pinned = notes.filter((n) => n.pinned)

  const tabbed = tab === "pinned" ? pinned : notes
  const statusFiltered =
    statusFilter === "drafts" ? tabbed.filter((n) => isNoteEmpty(n)) : statusFilter === "notes" ? tabbed.filter((n) => !isNoteEmpty(n)) : tabbed

  const searched = statusFiltered.filter(
    (n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.preview.toLowerCase().includes(query.toLowerCase())
  )

  const sorted = [...searched].sort((a: Note, b: Note) => {
    if (sort === "title") return (a.title || "").localeCompare(b.title || "")
    if (sort === "created") return b.createdAt - a.createdAt
    return b.updatedAt - a.updatedAt
  })

  const sortLabels: Record<Sort, string> = {
    updated: t.notes.sortUpdated,
    created: t.notes.sortCreated,
    title: t.notes.sortTitle,
  }

  return (
    <div className="p-12 w-full">
      <ScreenHeader
        title={t.nav.notes}
        action={
          <button
            type="button"
            onClick={() => openEditor(createNote().id)}
            className="no-drag flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            {t.common.new}
          </button>
        }
      />

      <div className="flex items-center gap-1 border-b border-line mb-6">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          {t.notes.tabAll}
        </TabButton>
        <TabButton active={tab === "pinned"} onClick={() => setTab("pinned")}>
          {t.notes.tabPinned}
        </TabButton>
        <TabButton active={false} onClick={() => setActiveModule("templates")}>
          {t.notes.tabTemplates}
        </TabButton>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label={t.notes.filterAll} count={notes.length} />
          <FilterChip active={statusFilter === "notes"} onClick={() => setStatusFilter("notes")} label={t.notes.filterNotes} count={realNotes.length} />
          <FilterChip active={statusFilter === "drafts"} onClick={() => setStatusFilter("drafts")} label={t.notes.filterDrafts} count={drafts.length} />
        </div>

        <div className="flex items-center gap-2.5">
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="no-drag flex items-center gap-1.5 bg-paper-raised border border-line rounded-full px-4 py-2 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
            >
              {sortLabels[sort]}
              <ChevronDown size={13} className={clsx("transition-transform", sortOpen && "rotate-180")} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-paper-raised border border-line rounded-xl shadow-lg z-30 p-1.5">
                {(Object.keys(sortLabels) as Sort[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key)
                      setSortOpen(false)
                    }}
                    className="w-full flex items-center justify-between gap-2 text-left px-2.5 py-1.5 rounded-lg text-[13px] text-ink hover:bg-black/5 transition-colors"
                  >
                    {sortLabels[key]}
                    {sort === key && <Check size={13} className="text-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.notes.searchPlaceholder}
              className="w-64 bg-paper-raised border border-line rounded-full pl-9 pr-4 py-2 text-[13.5px] outline-none focus:border-ink/30"
            />
          </div>
        </div>
      </div>

      <div ref={ref}>
        {sorted.length === 0 ? (
          <div className="anim-item text-center py-24 text-ink-soft text-[15px]">{t.notes.empty}</div>
        ) : (
          <div>
            <div className="hidden md:flex items-center gap-4 px-4 py-2.5 border-b border-line text-[11px] font-semibold text-ink-soft/60 uppercase tracking-wide">
              <span className="flex-1">{t.notes.colName}</span>
              <span className="w-24 shrink-0 text-center">{t.notes.colStatus}</span>
              <span className="w-20 shrink-0 text-center">{t.notes.colWords}</span>
              <span className="w-28 shrink-0 text-right">{t.notes.colUpdated}</span>
              <span className="w-8 shrink-0" />
            </div>
            <div className="divide-y divide-line">
              {sorted.map((n) => (
                <NoteListCard key={n.id} note={n} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "no-drag px-4 py-2.5 text-[14px] font-medium border-b-2 -mb-px transition-colors",
        active ? "border-blue text-blue" : "border-transparent text-ink-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "no-drag px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
        active ? "bg-ink text-paper" : "bg-black/4 text-ink-soft hover:bg-black/8"
      )}
    >
      {label} {count}
    </button>
  )
}
