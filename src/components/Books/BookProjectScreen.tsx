import { useMemo, useRef, useState } from "react"
import clsx from "clsx"
import { ArrowLeft, BookMarked, Download, FileText, GripVertical, Plus, Trash2, Users } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { tiptapWordCount, wordsWrittenToday } from "../../lib/bookEngine"
import { exportManuscriptAsDocx, exportManuscriptAsPdf } from "../../lib/bookExport"
import { sectionLabels, stylePresetLabels } from "../../lib/bookBlueprint"
import type { BookStylePreset } from "../../types"

type Tab = "chapters" | "characters"

export function BookProjectScreen() {
  const { t, lang } = useI18n()
  const labels = sectionLabels(lang)
  const presetLabels = stylePresetLabels(lang)
  const bookProjectId = useUiStore((s) => s.bookProjectId)
  const closeBookProject = useUiStore((s) => s.closeBookProject)
  const openBookChapter = useUiStore((s) => s.openBookChapter)

  const project = useAppStore((s) => s.bookProjects.find((p) => p.id === bookProjectId))
  const allChapters = useAppStore((s) => s.bookChapters)
  const allCharacters = useAppStore((s) => s.bookCharacters)
  const updateBookProject = useAppStore((s) => s.updateBookProject)
  const createBookChapter = useAppStore((s) => s.createBookChapter)
  const deleteBookChapter = useAppStore((s) => s.deleteBookChapter)
  const reorderBookChapters = useAppStore((s) => s.reorderBookChapters)
  const createBookCharacter = useAppStore((s) => s.createBookCharacter)
  const updateBookCharacter = useAppStore((s) => s.updateBookCharacter)
  const deleteBookCharacter = useAppStore((s) => s.deleteBookCharacter)

  const [tab, setTab] = useState<Tab>("chapters")
  const dragId = useRef<string | null>(null)

  const characters = useMemo(() => allCharacters.filter((c) => c.projectId === bookProjectId), [allCharacters, bookProjectId])
  const sortedChapters = useMemo(
    () => allChapters.filter((c) => c.projectId === bookProjectId).sort((a, b) => a.order - b.order),
    [allChapters, bookProjectId]
  )
  const frontMatter = useMemo(() => sortedChapters.filter((c) => c.kind === "front"), [sortedChapters])
  const numberedChapters = useMemo(() => sortedChapters.filter((c) => (c.kind ?? "chapter") === "chapter"), [sortedChapters])
  const backMatter = useMemo(() => sortedChapters.filter((c) => c.kind === "back"), [sortedChapters])
  const totalWords = useMemo(() => sortedChapters.reduce((sum, c) => sum + tiptapWordCount(c.content), 0), [sortedChapters])
  const todayWords = project ? wordsWrittenToday(project.wordHistory, totalWords) : 0

  if (!project) return null

  const handleDrop = (targetId: string) => {
    const draggedId = dragId.current
    dragId.current = null
    if (!draggedId || draggedId === targetId) return
    const ids = numberedChapters.map((c) => c.id)
    const from = ids.indexOf(draggedId)
    const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    const allIds = [...frontMatter.map((c) => c.id), ...ids, ...backMatter.map((c) => c.id)]
    reorderBookChapters(project.id, allIds)
  }

  const dailyPct = project.dailyWordGoal > 0 ? Math.min(100, Math.round((todayWords / project.dailyWordGoal) * 100)) : 0
  const totalPct = project.totalWordGoal > 0 ? Math.min(100, Math.round((totalWords / project.totalWordGoal) * 100)) : 0

  return (
    <div className="p-10 lg:p-12 w-full max-w-[900px] mx-auto">
      <button type="button" onClick={closeBookProject} className="no-drag flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink mb-6">
        <ArrowLeft size={14} />
        {t.books.allBooks}
      </button>

      <input
        value={project.title}
        onChange={(e) => updateBookProject(project.id, { title: e.target.value })}
        placeholder={t.books.bookTitleLabel}
        className="no-drag w-full bg-transparent outline-none font-serif text-[32px] font-medium text-ink mb-3"
      />

      {project.isBlueprint && (
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-2 text-[13px] text-ink-soft">
            <BookMarked size={14} className="text-blue shrink-0" />
            <input
              value={project.authorName}
              onChange={(e) => updateBookProject(project.id, { authorName: e.target.value })}
              placeholder={t.books.authorNamePlaceholder}
              className="no-drag bg-transparent outline-none border-b border-line/60 focus:border-ink/30 px-0.5"
            />
          </div>
          <div className="flex gap-1.5">
            {(["novel", "nonfiction", "poetry", "academic"] as BookStylePreset[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateBookProject(project.id, { stylePreset: p })}
                className={clsx(
                  "no-drag text-[11.5px] font-medium px-3 py-1 rounded-full border transition-colors",
                  project.stylePreset === p ? "bg-ink text-paper border-ink" : "border-line text-ink-soft hover:border-ink/30"
                )}
              >
                {presetLabels[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <GoalCard
          label={t.books.todaysGoal}
          value={todayWords}
          goal={project.dailyWordGoal}
          pct={dailyPct}
          wordsLabel={t.books.words}
          onChangeGoal={(g) => updateBookProject(project.id, { dailyWordGoal: g })}
        />
        <GoalCard
          label={t.books.totalManuscriptGoal}
          value={totalWords}
          goal={project.totalWordGoal}
          pct={totalPct}
          wordsLabel={t.books.words}
          onChangeGoal={(g) => updateBookProject(project.id, { totalWordGoal: g })}
        />
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5 bg-black/4 rounded-full p-1 w-fit">
          <button
            type="button"
            onClick={() => setTab("chapters")}
            className={clsx("text-[13.5px] font-medium px-4 py-1.5 rounded-full transition-colors", tab === "chapters" ? "bg-paper-raised text-ink border border-line" : "text-ink-soft")}
          >
            {t.books.chaptersTab}
          </button>
          <button
            type="button"
            onClick={() => setTab("characters")}
            className={clsx("text-[13.5px] font-medium px-4 py-1.5 rounded-full transition-colors", tab === "characters" ? "bg-paper-raised text-ink border border-line" : "text-ink-soft")}
          >
            {t.books.charactersTab}
          </button>
        </div>

        {tab === "chapters" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportManuscriptAsPdf(project, sortedChapters, lang)}
              className="no-drag flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink border border-line rounded-full px-3 py-1.5"
            >
              <Download size={13} />
              {t.books.exportPdf}
            </button>
            <button
              type="button"
              onClick={() => exportManuscriptAsDocx(project, sortedChapters, lang)}
              className="no-drag flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink border border-line rounded-full px-3 py-1.5"
            >
              <Download size={13} />
              {t.books.exportWord}
            </button>
          </div>
        )}
      </div>

      {tab === "chapters" ? (
        <div className="space-y-6">
          {frontMatter.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-ink-soft/60 uppercase tracking-wider mb-2">{t.books.frontMatter}</div>
              <div className="space-y-2">
                {frontMatter.map((chapter) => (
                  <ChapterRow
                    key={chapter.id}
                    label={labels[chapter.sectionType ?? ""] ?? chapter.title}
                    sub={chapter.sectionType === "toc" ? t.books.autoGenerated : `${tiptapWordCount(chapter.content)} ${t.books.words}`}
                    onOpen={() => openBookChapter(chapter.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            {project.isBlueprint && <div className="text-[11px] font-semibold text-ink-soft/60 uppercase tracking-wider mb-2">{t.books.chaptersTab}</div>}
            <div className="space-y-2">
              {numberedChapters.map((chapter, i) => (
                <div
                  key={chapter.id}
                  draggable
                  onDragStart={() => (dragId.current = chapter.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(chapter.id)}
                  className="group flex items-center gap-3 rounded-xl border border-line/70 bg-paper-raised px-3 py-3 hover:border-ink/20 transition-colors cursor-default"
                >
                  <GripVertical size={15} className="text-ink-soft/40 cursor-grab shrink-0" />
                  <button type="button" onClick={() => openBookChapter(chapter.id)} className="no-drag flex-1 min-w-0 text-start flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue/10 grid place-items-center shrink-0">
                      <FileText size={14} className="text-blue" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-ink truncate">
                        {t.books.chapterLabel} {i + 1}: {chapter.title || t.books.untitledChapter}
                      </div>
                      <div className="text-[12px] text-ink-soft">{tiptapWordCount(chapter.content)} {t.books.words}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    title={t.books.deleteChapter}
                    onClick={() => deleteBookChapter(chapter.id)}
                    className="no-drag opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose shrink-0 p-1.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => createBookChapter(project.id, `${t.books.chapterLabel} ${numberedChapters.length + 1}`, "chapter", undefined, lang)}
                className="no-drag w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-ink-soft hover:border-ink/25 hover:text-ink transition-colors py-3.5 text-[13.5px] font-medium"
              >
                <Plus size={15} />
                {t.books.newChapter}
              </button>
            </div>
          </div>

          {project.isBlueprint && (
            <div>
              <div className="text-[11px] font-semibold text-ink-soft/60 uppercase tracking-wider mb-2">{t.books.backMatter}</div>
              <div className="space-y-2">
                {backMatter.map((chapter) => (
                  <ChapterRow
                    key={chapter.id}
                    label={`${labels[chapter.sectionType ?? ""] ?? chapter.title}: ${chapter.title}`}
                    sub={`${tiptapWordCount(chapter.content)} ${t.books.words}`}
                    onOpen={() => openBookChapter(chapter.id)}
                    onDelete={() => deleteBookChapter(chapter.id)}
                  />
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => createBookChapter(project.id, t.books.appendix, "back", "appendix", lang)}
                    className="no-drag flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-ink-soft hover:border-ink/25 hover:text-ink transition-colors py-2.5 text-[12.5px] font-medium"
                  >
                    <Plus size={13} />
                    {t.books.addAppendix}
                  </button>
                  <button
                    type="button"
                    onClick={() => createBookChapter(project.id, t.books.notes, "back", "notes", lang)}
                    className="no-drag flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-ink-soft hover:border-ink/25 hover:text-ink transition-colors py-2.5 text-[12.5px] font-medium"
                  >
                    <Plus size={13} />
                    {t.books.addNotes}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {characters.map((c) => (
            <div key={c.id} className="group relative rounded-xl border border-line/70 bg-paper-raised p-4">
              <button
                type="button"
                title={t.books.deleteCharacter}
                onClick={() => deleteBookCharacter(c.id)}
                className="no-drag absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose"
              >
                <Trash2 size={13} />
              </button>
              <input
                value={c.name}
                onChange={(e) => updateBookCharacter(c.id, { name: e.target.value })}
                placeholder={t.books.characterNamePlaceholder}
                className="no-drag w-full bg-transparent outline-none text-[14.5px] font-semibold text-ink mb-2 pr-6"
              />
              <textarea
                value={c.traits}
                onChange={(e) => updateBookCharacter(c.id, { traits: e.target.value })}
                placeholder={t.books.traitsPlaceholder}
                rows={2}
                className="no-drag w-full bg-paper border border-line rounded-lg px-2.5 py-2 text-[12.5px] outline-none focus:border-ink/30 resize-none mb-2"
              />
              <textarea
                value={c.relationships}
                onChange={(e) => updateBookCharacter(c.id, { relationships: e.target.value })}
                placeholder={t.books.relationshipsPlaceholder}
                rows={2}
                className="no-drag w-full bg-paper border border-line rounded-lg px-2.5 py-2 text-[12.5px] outline-none focus:border-ink/30 resize-none mb-2"
              />
              <textarea
                value={c.notes}
                onChange={(e) => updateBookCharacter(c.id, { notes: e.target.value })}
                placeholder={t.books.otherNotesPlaceholder}
                rows={2}
                className="no-drag w-full bg-paper border border-line rounded-lg px-2.5 py-2 text-[12.5px] outline-none focus:border-ink/30 resize-none"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => createBookCharacter(project.id)}
            className="no-drag min-h-[160px] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-ink-soft hover:border-ink/25 hover:text-ink transition-colors"
          >
            <Users size={18} />
            <span className="text-[13px] font-medium">{t.books.newCharacter}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function ChapterRow({
  label,
  sub,
  onOpen,
  onDelete,
}: {
  label: string
  sub: string
  onOpen: () => void
  onDelete?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-line/70 bg-paper-raised px-3 py-3 hover:border-ink/20 transition-colors">
      <button type="button" onClick={onOpen} className="no-drag flex-1 min-w-0 text-start flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber/15 grid place-items-center shrink-0">
          <FileText size={14} className="text-amber" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-ink truncate">{label}</div>
          <div className="text-[12px] text-ink-soft">{sub}</div>
        </div>
      </button>
      {onDelete && (
        <button
          type="button"
          title={t.books.deleteEntry}
          onClick={onDelete}
          className="no-drag opacity-0 group-hover:opacity-100 text-ink-soft/60 hover:text-rose shrink-0 p-1.5"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

function GoalCard({
  label,
  value,
  goal,
  pct,
  wordsLabel,
  onChangeGoal,
}: {
  label: string
  value: number
  goal: number
  pct: number
  wordsLabel: string
  onChangeGoal: (goal: number) => void
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-ink-soft">{label}</span>
        <div className="flex items-center gap-1 text-[12px] text-ink-soft">
          <input
            type="number"
            value={goal}
            title={wordsLabel}
            onChange={(e) => onChangeGoal(Math.max(0, Number(e.target.value) || 0))}
            className="no-drag w-16 bg-transparent text-right outline-none border-b border-line/60 focus:border-ink/30"
          />
          {wordsLabel}
        </div>
      </div>
      <div className="text-[20px] font-semibold text-ink mb-2">{value.toLocaleString()}</div>
      <div className="h-1.5 rounded-full bg-black/6 overflow-hidden">
        <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
