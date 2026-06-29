import { create } from "zustand"
import { makeId } from "../lib/id"
import type {
  AppData,
  BookCharacter,
  BookChapter,
  BookProject,
  CalendarEntry,
  ClassItem,
  CustomTemplate,
  Dialogue,
  DialoguePreset,
  Flashcard,
  FlashcardRating,
  GratitudeEntry,
  Letter,
  LetterRecipient,
  MemoryInsights,
  MoodEntry,
  MoodValue,
  Movie,
  MovieRecommendations,
  Note,
  Notebook,
  Settings,
  StreamSession,
  BookStylePreset,
  Lang,
  ThreadPost,
} from "../types"
import { tiptapWordCount, upsertWordHistory } from "../lib/bookEngine"
import { buildChapterContent, buildCopyrightPageContent, buildDedicationContent, buildIntroductionContent, buildTitlePageContent, buildTocPlaceholderContent } from "../lib/bookBlueprint"

const defaultSettings: Settings = {
  lang: "en",
  theme: "dark",
  omdbApiKey: "cc715903",
  userName: "",
  dialogueHistory: false,
  googleDriveClientId: "",
  googleDriveApiKey: "",
  hasOnboarded: false,
}

const emptyData: AppData = {
  notes: [],
  calendarEntries: [],
  moodEntries: [],
  gratitudeEntries: [],
  letters: [],
  threadPosts: [],
  streamSessions: [],
  dialogues: [],
  classes: [],
  notebooks: [],
  flashcards: [],
  movies: [],
  movieRecommendations: null,
  memoryInsights: null,
  customTemplates: [],
  bookProjects: [],
  bookChapters: [],
  bookCharacters: [],
  settings: defaultSettings,
}

const classEmojis = ["📘", "📗", "📙", "📕", "📓", "🧮", "🔬", "🎨", "🌍", "💻"]
const classColors: ClassItem["color"][] = ["amber", "blue", "sage", "rose"]

interface AppState extends AppData {
  hydrated: boolean
  activeNoteId: string | null
  hydrate: () => Promise<void>
  persist: () => void
  saveNow: () => Promise<void>

  // sync conflict (e.g. a cloud-sync client overwrote data.json while the app was open)
  syncConflict: AppData | null
  setSyncConflict: (remote: AppData | null) => void
  keepMyVersion: () => Promise<void>
  useOtherVersion: () => void

  // notes
  createNote: (partial?: Partial<Note>) => Note
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  setActiveNote: (id: string | null) => void

  // calendar
  addCalendarEntry: (entry: Omit<CalendarEntry, "id" | "createdAt">) => void
  updateCalendarEntry: (id: string, patch: Partial<CalendarEntry>) => void
  removeCalendarEntry: (id: string) => void

  // mood
  addMoodEntry: (mood: MoodValue, note: string) => MoodEntry
  // gratitude
  addGratitudeEntry: (text: string, reward?: string) => void
  // letters
  createLetter: (recipient: LetterRecipient) => Letter
  updateLetter: (id: string, patch: Partial<Letter>) => void
  deleteLetter: (id: string) => void
  // threads
  createThreadPost: (text: string, parentId?: string) => ThreadPost
  updateThreadPost: (id: string, patch: Partial<ThreadPost>) => void
  deleteThreadPost: (id: string) => void
  toggleThreadPostLike: (id: string) => void
  repostThreadPost: (id: string) => ThreadPost | null
  // stream
  addStreamSession: (minutes: number, content: string) => StreamSession
  // dialogue
  createDialogue: (preset: DialoguePreset, otherLabel: string) => Dialogue
  updateDialogue: (id: string, patch: Partial<Dialogue>) => void
  deleteDialogue: (id: string) => void

  // school
  createClass: (name: string) => ClassItem
  renameClass: (id: string, name: string) => void
  deleteClass: (id: string) => void
  createNotebook: (classId: string, name: string, description: string) => Notebook
  updateNotebook: (id: string, patch: Partial<Pick<Notebook, "name" | "description">>) => void
  deleteNotebook: (id: string) => void

  addFlashcards: (notebookId: string, cards: { question: string; answer: string }[]) => Flashcard[]
  reviewFlashcard: (id: string, rating: FlashcardRating) => void
  deleteFlashcard: (id: string) => void

  // movies
  addMovie: (movie: Omit<Movie, "id" | "createdAt">) => Movie
  updateMovie: (id: string, patch: Partial<Movie>) => void
  deleteMovie: (id: string) => void
  setMovieRecommendations: (rec: MovieRecommendations) => void
  setMemoryInsights: (insights: MemoryInsights) => void

  // custom templates
  createCustomTemplate: (partial?: Partial<CustomTemplate>) => CustomTemplate
  updateCustomTemplate: (id: string, patch: Partial<CustomTemplate>) => void
  deleteCustomTemplate: (id: string) => void

  // book projects
  createBookProject: (title?: string) => BookProject
  createManuscriptBlueprint: (title: string, authorName: string, stylePreset: BookStylePreset, lang?: Lang) => BookProject
  updateBookProject: (id: string, patch: Partial<Pick<BookProject, "title" | "authorName" | "stylePreset" | "dailyWordGoal" | "totalWordGoal">>) => void
  deleteBookProject: (id: string) => void
  createBookChapter: (projectId: string, title?: string, kind?: BookChapter["kind"], sectionType?: BookChapter["sectionType"], lang?: Lang) => BookChapter
  updateBookChapter: (id: string, patch: Partial<Pick<BookChapter, "title" | "content">>) => void
  deleteBookChapter: (id: string) => void
  reorderBookChapters: (projectId: string, orderedIds: string[]) => void
  saveChapterDraft: (chapterId: string, label: string) => void
  restoreChapterDraft: (chapterId: string, draftId: string) => void
  deleteChapterDraft: (chapterId: string, draftId: string) => void
  createBookCharacter: (projectId: string) => BookCharacter
  updateBookCharacter: (id: string, patch: Partial<Pick<BookCharacter, "name" | "traits" | "relationships" | "notes">>) => void
  deleteBookCharacter: (id: string) => void

  updateSettings: (patch: Partial<Settings>) => void

  // backup
  exportBackup: () => AppData
  restoreFromBackup: (data: AppData) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function snapshot(state: AppState): AppData {
  return {
    notes: state.notes,
    calendarEntries: state.calendarEntries,
    moodEntries: state.moodEntries,
    gratitudeEntries: state.gratitudeEntries,
    letters: state.letters,
    threadPosts: state.threadPosts,
    streamSessions: state.streamSessions,
    dialogues: state.dialogues,
    classes: state.classes,
    notebooks: state.notebooks,
    flashcards: state.flashcards,
    movies: state.movies,
    movieRecommendations: state.movieRecommendations,
    memoryInsights: state.memoryInsights,
    customTemplates: state.customTemplates,
    bookProjects: state.bookProjects,
    bookChapters: state.bookChapters,
    bookCharacters: state.bookCharacters,
    settings: state.settings,
  }
}

function schedulePersist(get: () => AppState) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    if (get().syncConflict) return
    const result = await window.myna?.data.save(snapshot(get()))
    if (result && !result.ok && result.conflict) {
      get().setSyncConflict(result.remote ?? null)
    }
  }, 400)
}

async function flushPersist(get: () => AppState) {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (get().syncConflict) return
  const result = await window.myna?.data.save(snapshot(get()))
  if (result && !result.ok && result.conflict) {
    get().setSyncConflict(result.remote ?? null)
  }
}

function previewFromContent(content: string): string {
  try {
    const json = JSON.parse(content)
    let text = ""
    const walk = (node: { text?: string; content?: unknown[] }) => {
      if (text.length > 140) return
      if (node.text) text += node.text + " "
      if (Array.isArray(node.content)) node.content.forEach((c) => walk(c as { text?: string; content?: unknown[] }))
    }
    walk(json)
    return text.trim().slice(0, 140)
  } catch {
    return content.slice(0, 140)
  }
}

function migrateBookData(data: AppData): AppData {
  return {
    ...data,
    bookProjects: (data.bookProjects ?? []).map((p) => ({
      authorName: "",
      isBlueprint: false,
      stylePreset: "novel" as const,
      ...(p as unknown as Record<string, unknown>),
    })) as BookProject[],
    bookChapters: (data.bookChapters ?? []).map((c) => ({ kind: "chapter" as const, ...(c as unknown as Record<string, unknown>) })) as BookChapter[],
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  ...emptyData,
  hydrated: false,
  activeNoteId: null,
  syncConflict: null,

  hydrate: async () => {
    const raw = await window.myna?.data.load()
    const data = raw ? migrateBookData(raw) : raw
    if (data) {
      set({
        ...data,
        settings: {
          ...defaultSettings,
          ...data.settings,
          omdbApiKey: data.settings?.omdbApiKey || defaultSettings.omdbApiKey,
          // Show onboarding unless it was explicitly completed. (No pre-onboarding
          // installs exist to protect, so a stray/partial data file must not skip it.)
          hasOnboarded: data.settings?.hasOnboarded === true,
        },
        hydrated: true,
      })
    } else {
      set({ hydrated: true })
    }
  },

  persist: () => schedulePersist(get),
  saveNow: () => flushPersist(get),

  setSyncConflict: (remote) => set({ syncConflict: remote }),

  keepMyVersion: async () => {
    await window.myna?.data.save(snapshot(get()), { force: true })
    set({ syncConflict: null })
  },

  useOtherVersion: () => {
    const remote = get().syncConflict
    if (!remote) return
    const data = migrateBookData(remote)
    set({
      ...data,
      settings: { ...defaultSettings, ...data.settings, omdbApiKey: data.settings?.omdbApiKey || defaultSettings.omdbApiKey },
      syncConflict: null,
    })
  },

  createNote: (partial) => {
    const now = Date.now()
    const note: Note = {
      id: makeId(),
      title: "",
      content: "",
      preview: "",
      tags: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
      ...partial,
    }
    set((s) => ({ notes: [note, ...s.notes] }))
    schedulePersist(get)
    return note
  },

  updateNote: (id, patch) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...patch,
              preview: patch.content ? previewFromContent(patch.content) : n.preview,
              updatedAt: Date.now(),
            }
          : n
      ),
    }))
    schedulePersist(get)
  },

  deleteNote: (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    schedulePersist(get)
  },

  togglePin: (id) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }))
    schedulePersist(get)
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  addCalendarEntry: (entry) => {
    const item: CalendarEntry = { ...entry, id: makeId(), createdAt: Date.now() }
    set((s) => ({ calendarEntries: [...s.calendarEntries, item] }))
    schedulePersist(get)
  },

  updateCalendarEntry: (id, patch) => {
    set((s) => ({
      calendarEntries: s.calendarEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
    schedulePersist(get)
  },

  removeCalendarEntry: (id) => {
    set((s) => ({ calendarEntries: s.calendarEntries.filter((e) => e.id !== id) }))
    schedulePersist(get)
  },

  addMoodEntry: (mood, note) => {
    const entry: MoodEntry = {
      id: makeId(),
      date: new Date().toISOString().slice(0, 10),
      mood,
      note,
      createdAt: Date.now(),
    }
    set((s) => ({ moodEntries: [entry, ...s.moodEntries] }))
    schedulePersist(get)
    return entry
  },

  addGratitudeEntry: (text, reward) => {
    const entry: GratitudeEntry = {
      id: makeId(),
      date: new Date().toISOString().slice(0, 10),
      text,
      reward,
      createdAt: Date.now(),
    }
    set((s) => ({ gratitudeEntries: [entry, ...s.gratitudeEntries] }))
    schedulePersist(get)
  },

  createLetter: (recipient) => {
    const now = Date.now()
    const letter: Letter = {
      id: makeId(),
      recipient,
      title: "",
      content: "",
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ letters: [letter, ...s.letters] }))
    schedulePersist(get)
    return letter
  },

  updateLetter: (id, patch) => {
    set((s) => ({
      letters: s.letters.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: Date.now() } : l)),
    }))
    schedulePersist(get)
  },

  deleteLetter: (id) => {
    set((s) => ({ letters: s.letters.filter((l) => l.id !== id) }))
    schedulePersist(get)
  },

  createThreadPost: (text, parentId) => {
    const now = Date.now()
    const post: ThreadPost = {
      id: makeId(),
      text,
      liked: false,
      parentId,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ threadPosts: [post, ...s.threadPosts] }))
    schedulePersist(get)
    return post
  },

  updateThreadPost: (id, patch) => {
    set((s) => ({
      threadPosts: s.threadPosts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    }))
    schedulePersist(get)
  },

  deleteThreadPost: (id) => {
    set((s) => ({ threadPosts: s.threadPosts.filter((p) => p.id !== id && p.parentId !== id) }))
    schedulePersist(get)
  },

  toggleThreadPostLike: (id) => {
    set((s) => ({
      threadPosts: s.threadPosts.map((p) => (p.id === id ? { ...p, liked: !p.liked, updatedAt: Date.now() } : p)),
    }))
    schedulePersist(get)
  },

  repostThreadPost: (id) => {
    const original = get().threadPosts.find((p) => p.id === id)
    if (!original) return null
    const now = Date.now()
    const repost: ThreadPost = {
      id: makeId(),
      text: original.text,
      liked: false,
      repostOf: original.repostOf ?? original.id,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ threadPosts: [repost, ...s.threadPosts] }))
    schedulePersist(get)
    return repost
  },

  addStreamSession: (minutes, content) => {
    const session: StreamSession = { id: makeId(), minutes, content, createdAt: Date.now() }
    set((s) => ({ streamSessions: [session, ...s.streamSessions] }))
    schedulePersist(get)
    return session
  },

  createDialogue: (preset, otherLabel) => {
    const now = Date.now()
    const dialogue: Dialogue = {
      id: makeId(),
      preset,
      otherLabel,
      lines: [],
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ dialogues: [dialogue, ...s.dialogues] }))
    schedulePersist(get)
    return dialogue
  },

  updateDialogue: (id, patch) => {
    set((s) => ({
      dialogues: s.dialogues.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)),
    }))
    schedulePersist(get)
  },

  deleteDialogue: (id) => {
    set((s) => ({ dialogues: s.dialogues.filter((d) => d.id !== id) }))
    schedulePersist(get)
  },

  createClass: (name) => {
    const item: ClassItem = {
      id: makeId(),
      name,
      emoji: classEmojis[Math.floor(Math.random() * classEmojis.length)],
      color: classColors[Math.floor(Math.random() * classColors.length)],
      createdAt: Date.now(),
    }
    set((s) => ({ classes: [...s.classes, item] }))
    schedulePersist(get)
    return item
  },

  renameClass: (id, name) => {
    set((s) => ({ classes: s.classes.map((c) => (c.id === id ? { ...c, name } : c)) }))
    schedulePersist(get)
  },

  deleteClass: (id) => {
    set((s) => {
      const notebookIds = new Set(s.notebooks.filter((n) => n.classId === id).map((n) => n.id))
      return {
        classes: s.classes.filter((c) => c.id !== id),
        notebooks: s.notebooks.filter((n) => n.classId !== id),
        flashcards: s.flashcards.filter((f) => !notebookIds.has(f.notebookId)),
        notes: s.notes.map((n) => (n.classId === id ? { ...n, classId: undefined, notebookId: undefined } : n)),
      }
    })
    schedulePersist(get)
  },

  createNotebook: (classId, name, description) => {
    const item: Notebook = {
      id: makeId(),
      classId,
      name,
      description,
      emoji: classEmojis[Math.floor(Math.random() * classEmojis.length)],
      createdAt: Date.now(),
    }
    set((s) => ({ notebooks: [...s.notebooks, item] }))
    schedulePersist(get)
    return item
  },

  updateNotebook: (id, patch) => {
    set((s) => ({ notebooks: s.notebooks.map((n) => (n.id === id ? { ...n, ...patch } : n)) }))
    schedulePersist(get)
  },

  deleteNotebook: (id) => {
    set((s) => ({
      notebooks: s.notebooks.filter((n) => n.id !== id),
      flashcards: s.flashcards.filter((f) => f.notebookId !== id),
      notes: s.notes.map((n) => (n.notebookId === id ? { ...n, notebookId: undefined } : n)),
    }))
    schedulePersist(get)
  },

  addFlashcards: (notebookId, cards) => {
    const now = Date.now()
    const items: Flashcard[] = cards.map((c) => ({
      id: makeId(),
      notebookId,
      question: c.question,
      answer: c.answer,
      interval: 1,
      dueAt: now,
      reviews: 0,
      createdAt: now,
    }))
    set((s) => ({ flashcards: [...s.flashcards, ...items] }))
    schedulePersist(get)
    return items
  },

  reviewFlashcard: (id, rating) => {
    set((s) => ({
      flashcards: s.flashcards.map((f) => {
        if (f.id !== id) return f
        const factor = rating === "again" ? 0 : rating === "hard" ? 1.2 : rating === "good" ? 2.2 : 3.4
        const nextInterval = rating === "again" ? 1 : Math.max(1, Math.round(f.interval * factor))
        return {
          ...f,
          interval: nextInterval,
          dueAt: Date.now() + nextInterval * 86400000,
          reviews: f.reviews + 1,
        }
      }),
    }))
    schedulePersist(get)
  },

  deleteFlashcard: (id) => {
    set((s) => ({ flashcards: s.flashcards.filter((f) => f.id !== id) }))
    schedulePersist(get)
  },

  addMovie: (movie) => {
    const item: Movie = { ...movie, id: makeId(), createdAt: Date.now() }
    set((s) => ({ movies: [item, ...s.movies] }))
    schedulePersist(get)
    return item
  },

  updateMovie: (id, patch) => {
    set((s) => ({ movies: s.movies.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    schedulePersist(get)
  },

  deleteMovie: (id) => {
    set((s) => ({ movies: s.movies.filter((m) => m.id !== id) }))
    schedulePersist(get)
  },

  setMovieRecommendations: (rec) => {
    set({ movieRecommendations: rec })
    schedulePersist(get)
  },

  setMemoryInsights: (insights) => {
    set({ memoryInsights: insights })
    schedulePersist(get)
  },

  createCustomTemplate: (partial) => {
    const now = Date.now()
    const tpl: CustomTemplate = {
      id: makeId(),
      name: "Untitled template",
      content: "",
      createdAt: now,
      updatedAt: now,
      ...partial,
    }
    set((s) => ({ customTemplates: [tpl, ...s.customTemplates] }))
    schedulePersist(get)
    return tpl
  },

  updateCustomTemplate: (id, patch) => {
    set((s) => ({
      customTemplates: s.customTemplates.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t)),
    }))
    schedulePersist(get)
  },

  deleteCustomTemplate: (id) => {
    set((s) => ({ customTemplates: s.customTemplates.filter((t) => t.id !== id) }))
    schedulePersist(get)
  },

  createBookProject: (title) => {
    const now = Date.now()
    const project: BookProject = {
      id: makeId(),
      title: title ?? "",
      authorName: "",
      isBlueprint: false,
      stylePreset: "novel",
      dailyWordGoal: 500,
      totalWordGoal: 50000,
      wordHistory: [],
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ bookProjects: [project, ...s.bookProjects] }))
    schedulePersist(get)
    return project
  },

  createManuscriptBlueprint: (title, authorName, stylePreset, lang = "en") => {
    const now = Date.now()
    const project: BookProject = {
      id: makeId(),
      title,
      authorName,
      isBlueprint: true,
      stylePreset,
      dailyWordGoal: 500,
      totalWordGoal: 50000,
      wordHistory: [],
      createdAt: now,
      updatedAt: now,
    }
    const mk = (order: number, kind: BookChapter["kind"], sectionType: BookChapter["sectionType"], chapTitle: string, content: string): BookChapter => ({
      id: makeId(),
      projectId: project.id,
      title: chapTitle,
      order,
      content,
      drafts: [],
      kind,
      sectionType,
      createdAt: now,
      updatedAt: now,
    })
    const chapters: BookChapter[] = [
      mk(0, "front", "title", "", buildTitlePageContent(title, authorName, lang)),
      mk(1, "front", "copyright", "", buildCopyrightPageContent(authorName, lang)),
      mk(2, "front", "toc", "", buildTocPlaceholderContent(lang)),
      mk(3, "front", "dedication", "", buildDedicationContent(lang)),
      mk(4, "front", "introduction", "", buildIntroductionContent(lang)),
      mk(5, "chapter", undefined, "", buildChapterContent(0, lang)),
    ]
    set((s) => ({ bookProjects: [project, ...s.bookProjects], bookChapters: [...s.bookChapters, ...chapters] }))
    schedulePersist(get)
    return project
  },

  updateBookProject: (id, patch) => {
    set((s) => ({ bookProjects: s.bookProjects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)) }))
    schedulePersist(get)
  },

  deleteBookProject: (id) => {
    set((s) => ({
      bookProjects: s.bookProjects.filter((p) => p.id !== id),
      bookChapters: s.bookChapters.filter((c) => c.projectId !== id),
      bookCharacters: s.bookCharacters.filter((c) => c.projectId !== id),
    }))
    schedulePersist(get)
  },

  createBookChapter: (projectId, title, kind = "chapter", sectionType, lang = "en") => {
    const now = Date.now()
    const existing = get().bookChapters.filter((c) => c.projectId === projectId)
    const order = existing.length
    const isBlueprint = get().bookProjects.find((p) => p.id === projectId)?.isBlueprint
    const chapterIndex = existing.filter((c) => c.kind === "chapter").length
    const chapter: BookChapter = {
      id: makeId(),
      projectId,
      title: title ?? "",
      order,
      content: kind === "chapter" && isBlueprint ? buildChapterContent(chapterIndex, lang) : "",
      drafts: [],
      kind,
      sectionType,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ bookChapters: [...s.bookChapters, chapter] }))
    schedulePersist(get)
    return chapter
  },

  updateBookChapter: (id, patch) => {
    set((s) => {
      const bookChapters = s.bookChapters.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c))
      const chapter = bookChapters.find((c) => c.id === id)
      if (!chapter) return { bookChapters }
      const total = bookChapters.filter((c) => c.projectId === chapter.projectId).reduce((sum, c) => sum + tiptapWordCount(c.content), 0)
      const bookProjects = s.bookProjects.map((p) =>
        p.id === chapter.projectId ? { ...p, wordHistory: upsertWordHistory(p.wordHistory, total) } : p
      )
      return { bookChapters, bookProjects }
    })
    schedulePersist(get)
  },

  deleteBookChapter: (id) => {
    set((s) => ({ bookChapters: s.bookChapters.filter((c) => c.id !== id) }))
    schedulePersist(get)
  },

  reorderBookChapters: (projectId, orderedIds) => {
    set((s) => ({
      bookChapters: s.bookChapters.map((c) => {
        if (c.projectId !== projectId) return c
        const order = orderedIds.indexOf(c.id)
        return order === -1 ? c : { ...c, order }
      }),
    }))
    schedulePersist(get)
  },

  saveChapterDraft: (chapterId, label) => {
    set((s) => ({
      bookChapters: s.bookChapters.map((c) =>
        c.id === chapterId
          ? { ...c, drafts: [...c.drafts, { id: makeId(), label: label || `Draft ${c.drafts.length + 1}`, content: c.content, savedAt: Date.now() }] }
          : c
      ),
    }))
    schedulePersist(get)
  },

  restoreChapterDraft: (chapterId, draftId) => {
    set((s) => ({
      bookChapters: s.bookChapters.map((c) => {
        if (c.id !== chapterId) return c
        const draft = c.drafts.find((d) => d.id === draftId)
        return draft ? { ...c, content: draft.content, updatedAt: Date.now() } : c
      }),
    }))
    schedulePersist(get)
  },

  deleteChapterDraft: (chapterId, draftId) => {
    set((s) => ({
      bookChapters: s.bookChapters.map((c) => (c.id === chapterId ? { ...c, drafts: c.drafts.filter((d) => d.id !== draftId) } : c)),
    }))
    schedulePersist(get)
  },

  createBookCharacter: (projectId) => {
    const character: BookCharacter = {
      id: makeId(),
      projectId,
      name: "New character",
      traits: "",
      relationships: "",
      notes: "",
      createdAt: Date.now(),
    }
    set((s) => ({ bookCharacters: [...s.bookCharacters, character] }))
    schedulePersist(get)
    return character
  },

  updateBookCharacter: (id, patch) => {
    set((s) => ({ bookCharacters: s.bookCharacters.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
    schedulePersist(get)
  },

  deleteBookCharacter: (id) => {
    set((s) => ({ bookCharacters: s.bookCharacters.filter((c) => c.id !== id) }))
    schedulePersist(get)
  },

  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }))
    schedulePersist(get)
  },

  exportBackup: () => snapshot(get()),

  restoreFromBackup: (data) => {
    const migrated = migrateBookData(data)
    set({
      ...emptyData,
      ...migrated,
      settings: { ...defaultSettings, ...migrated.settings, omdbApiKey: migrated.settings?.omdbApiKey || defaultSettings.omdbApiKey },
      hydrated: true,
    })
    schedulePersist(get)
  },
}))
