import { create } from "zustand"
import type { ModuleKey, MoodValue } from "../types"
import { useAppStore } from "./appStore"

export interface MoodInsight {
  mood: MoodValue
  quote: string
}

interface UiState {
  activeModule: ModuleKey
  pendingModule: ModuleKey | null
  setActiveModule: (m: ModuleKey) => void
  confirmModuleSwitch: (save: boolean) => void
  cancelModuleSwitch: () => void
  editorOpen: boolean
  editingNoteId: string | null
  openEditor: (noteId: string) => void
  closeEditor: () => void
  moodInsight: MoodInsight | null
  setMoodInsight: (insight: MoodInsight | null) => void
  pendingLetterId: string | null
  setPendingLetterId: (id: string | null) => void
  sidebarVisible: boolean
  toggleSidebar: () => void
  templateDoc: { kind: "note" | "template"; id: string } | null
  openTemplateDoc: (noteId: string) => void
  openTemplateBlueprint: (templateId: string) => void
  closeTemplateDoc: () => void
  bookProjectId: string | null
  bookChapterId: string | null
  openBookProject: (id: string) => void
  closeBookProject: () => void
  openBookChapter: (id: string) => void
  closeBookChapter: () => void
  alertMessage: { title: string | null; message: string } | null
  showAlert: (message: string, title?: string) => void
  hideAlert: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  activeModule: "home",
  pendingModule: null,
  setActiveModule: (m) => {
    const s = get()
    if (m === s.activeModule) return
    const isWriting = s.editorOpen || !!s.bookChapterId || !!s.templateDoc
    if (isWriting) {
      set({ pendingModule: m })
      return
    }
    set({ activeModule: m })
  },
  confirmModuleSwitch: (save) => {
    const target = get().pendingModule
    if (!target) return
    if (save) useAppStore.getState().saveNow()
    set({
      activeModule: target,
      pendingModule: null,
      editorOpen: false,
      editingNoteId: null,
      bookProjectId: null,
      bookChapterId: null,
      templateDoc: null,
    })
  },
  cancelModuleSwitch: () => set({ pendingModule: null }),
  editorOpen: false,
  editingNoteId: null,
  openEditor: (noteId) => set({ editorOpen: true, editingNoteId: noteId }),
  closeEditor: () => set({ editorOpen: false, editingNoteId: null }),
  moodInsight: null,
  setMoodInsight: (insight) => set({ moodInsight: insight }),
  pendingLetterId: null,
  setPendingLetterId: (id) => set({ pendingLetterId: id }),
  sidebarVisible: true,
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  templateDoc: null,
  openTemplateDoc: (noteId) => set({ templateDoc: { kind: "note", id: noteId } }),
  openTemplateBlueprint: (templateId) => set({ templateDoc: { kind: "template", id: templateId } }),
  closeTemplateDoc: () => set({ templateDoc: null }),
  bookProjectId: null,
  bookChapterId: null,
  openBookProject: (id) => set({ bookProjectId: id, bookChapterId: null }),
  closeBookProject: () => set({ bookProjectId: null, bookChapterId: null }),
  openBookChapter: (id) => set({ bookChapterId: id }),
  closeBookChapter: () => set({ bookChapterId: null }),
  alertMessage: null,
  showAlert: (message, title) => set({ alertMessage: { title: title ?? null, message } }),
  hideAlert: () => set({ alertMessage: null }),
}))
