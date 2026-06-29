export type Lang = "en" | "da"

export type ModuleKey =
  | "home"
  | "notes"
  | "editor"
  | "calendar"
  | "school"
  | "prompts"
  | "mood"
  | "gratitude"
  | "letters"
  | "threads"
  | "stream"
  | "dialogue"
  | "templates"
  | "movies"
  | "books"
  | "settings"

export interface Citation {
  id: string
  title: string
  author: string
  year: string
  url: string
}

export interface Note {
  id: string
  title: string
  content: string // tiptap JSON stringified
  preview: string
  tags: string[]
  pinned: boolean
  classId?: string
  notebookId?: string
  citations?: Citation[]
  createdAt: number
  updatedAt: number
}

export interface CalendarEntry {
  id: string
  date: string // yyyy-MM-dd
  kind: "note" | "reminder" | "mood"
  text: string
  isTask?: boolean
  done?: boolean
  time?: string // HH:mm, optional
  notified?: boolean
  createdAt: number
}

export type MoodValue = "great" | "good" | "okay" | "low" | "rough"

export interface MoodEntry {
  id: string
  date: string
  mood: MoodValue
  note: string
  createdAt: number
}

export interface GratitudeEntry {
  id: string
  date: string
  text: string
  reward?: string
  createdAt: number
}

export type LetterRecipient =
  | "pastSelf"
  | "futureSelf"
  | "someoneIMiss"
  | "someoneWhoHurtMe"
  | "someoneILove"
  | "closure"

export interface Letter {
  id: string
  recipient: LetterRecipient
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface ThreadPost {
  id: string
  text: string
  liked: boolean
  parentId?: string
  repostOf?: string
  createdAt: number
  updatedAt: number
}

export interface StreamSession {
  id: string
  minutes: number
  content: string
  createdAt: number
}

export type DialoguePreset =
  | "anxiety"
  | "futureSelf"
  | "innerChild"
  | "symbolic"
  | "custom"

export interface DialogueLine {
  id: string
  speaker: "me" | "other"
  text: string
}

export interface Dialogue {
  id: string
  preset: DialoguePreset
  otherLabel: string
  lines: DialogueLine[]
  createdAt: number
  updatedAt: number
}

export type MoviePriority = "low" | "medium" | "high"

export interface Movie {
  id: string
  title: string
  status: "watched" | "wishlist"
  rating?: number
  review?: string
  dateWatched?: string
  tags?: string[]
  priority?: MoviePriority
  createdAt: number
  imdbID?: string
  poster?: string
  imdbRating?: number
  plot?: string
  genre?: string
}

export interface MovieSearchResult {
  imdbID: string
  title: string
  year: string
  poster?: string
}

export interface MovieLookupResult {
  imdbID: string
  title: string
  year: string
  poster?: string
  imdbRating?: number
  plot?: string
  genre?: string
}

export interface MovieRecommendation {
  title: string
  year?: string
  genre?: string
  reason: string
  poster?: string
}

export interface MovieRecommendations {
  date: string
  items: MovieRecommendation[]
}

export interface MemoryInsights {
  date: string
  topics: string[]
  emotion: string
  goals: string[]
  style: string
  prompt: string
}

export interface Settings {
  lang: Lang
  theme: "light" | "dark" | "system"
  omdbApiKey: string
  userName: string
  dialogueHistory: boolean
  googleDriveClientId: string
  googleDriveApiKey: string
  hasOnboarded: boolean
}

export interface ClassItem {
  id: string
  name: string
  emoji: string
  color: "amber" | "blue" | "sage" | "rose"
  createdAt: number
}

export interface Notebook {
  id: string
  classId: string
  name: string
  description: string
  emoji: string
  createdAt: number
}

export type FlashcardRating = "again" | "hard" | "good" | "easy"

export interface Flashcard {
  id: string
  notebookId: string
  question: string
  answer: string
  interval: number // days until next review
  dueAt: number // timestamp
  reviews: number
  createdAt: number
}

export interface CustomTemplate {
  id: string
  name: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface BookChapterDraft {
  id: string
  label: string
  content: string
  savedAt: number
}

export type BookChapterKind = "front" | "chapter" | "back"

export type BookSectionType = "title" | "copyright" | "toc" | "dedication" | "introduction" | "appendix" | "notes"

export interface BookChapter {
  id: string
  projectId: string
  title: string
  order: number
  content: string
  drafts: BookChapterDraft[]
  kind: BookChapterKind
  sectionType?: BookSectionType
  createdAt: number
  updatedAt: number
}

export interface BookCharacter {
  id: string
  projectId: string
  name: string
  traits: string
  relationships: string
  notes: string
  createdAt: number
}

export interface BookWordSnapshot {
  date: string
  total: number
}

export type BookStylePreset = "novel" | "nonfiction" | "poetry" | "academic"

export interface BookProject {
  id: string
  title: string
  authorName: string
  isBlueprint: boolean
  stylePreset: BookStylePreset
  dailyWordGoal: number
  totalWordGoal: number
  wordHistory: BookWordSnapshot[]
  createdAt: number
  updatedAt: number
}

export interface AppData {
  notes: Note[]
  calendarEntries: CalendarEntry[]
  moodEntries: MoodEntry[]
  gratitudeEntries: GratitudeEntry[]
  letters: Letter[]
  threadPosts: ThreadPost[]
  streamSessions: StreamSession[]
  dialogues: Dialogue[]
  classes: ClassItem[]
  notebooks: Notebook[]
  flashcards: Flashcard[]
  movies: Movie[]
  movieRecommendations: MovieRecommendations | null
  memoryInsights: MemoryInsights | null
  customTemplates: CustomTemplate[]
  bookProjects: BookProject[]
  bookChapters: BookChapter[]
  bookCharacters: BookCharacter[]
  settings: Settings
}

declare global {
  interface Window {
    myna: {
      data: {
        load: () => Promise<AppData | null>
        save: (
          data: AppData,
          opts?: { force?: boolean }
        ) => Promise<{ ok: boolean; conflict?: boolean; remote?: AppData | null }>
      }
      notify: {
        show: (opts: { title: string; body: string }) => Promise<{ shown: boolean }>
      }
      exportFile: {
        saveBuffer: (opts: {
          defaultName: string
          filters: { name: string; extensions: string[] }[]
          buffer: ArrayBuffer | Uint8Array
        }) => Promise<{ canceled: boolean; filePath?: string }>
        revealInFolder: (filePath: string) => Promise<void>
      }
      backup: {
        export: (opts: { defaultName: string; buffer: ArrayBuffer | Uint8Array }) => Promise<{ canceled: boolean; filePath?: string }>
        import: () => Promise<{ data?: AppData; error?: string; canceled?: boolean }>
      }
      ai: {
        call: (opts: { system: string; prompt: string; maxTokens?: number }) => Promise<{ text?: string; error?: string }>
      }
      movies: {
        search: (opts: { apiKey: string; query: string }) => Promise<{ results?: MovieSearchResult[]; error?: string }>
        lookup: (opts: { apiKey: string; imdbID: string }) => Promise<{ movie?: MovieLookupResult; error?: string }>
      }
      win: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
        onMaximizeChanged: (cb: (isMaximized: boolean) => void) => () => void
        toggleFullscreen: () => void
        zoomIn: () => void
        zoomOut: () => void
        zoomReset: () => void
      }
      edit: {
        cut: () => void
        copy: () => void
        paste: () => void
      }
      menu: {
        importNote: () => Promise<{ note?: unknown; canceled?: boolean; error?: string }>
        showInfo: (opts: { title: string; message: string; detail: string }) => Promise<void>
      }
      app: {
        version: () => Promise<string>
        setLang: (lang: "en" | "da") => void
      }
      updates: {
        check: () => Promise<{ available: boolean; version?: string; url?: string; notes?: string }>
        open: (url: string) => void
      }
    }
  }
}
