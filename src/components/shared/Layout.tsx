import { TitleBar } from "./TitleBar"
import { Sidebar } from "./Sidebar"
import { useUiStore } from "../../store/uiStore"
import { useAppStore } from "../../store/appStore"
import { OnboardingScreen } from "../Onboarding/OnboardingScreen"
import { HomeScreen } from "../Home/HomeScreen"
import { NotesScreen } from "../Notes/NotesScreen"
import { CalendarScreen } from "../Calendar/CalendarScreen"
import { SchoolScreen } from "../School/SchoolScreen"
import { PromptsScreen } from "../Prompts/PromptsScreen"
import { MoodScreen } from "../Mood/MoodScreen"
import { GratitudeScreen } from "../Gratitude/GratitudeScreen"
import { LettersScreen } from "../Letters/LettersScreen"
import { ThreadsScreen } from "../Threads/ThreadsScreen"
import { StreamScreen } from "../Stream/StreamScreen"
import { DialogueScreen } from "../Dialogue/DialogueScreen"
import { TemplatesScreen } from "../Templates/TemplatesScreen"
import { MoviesScreen } from "../Movies/MoviesScreen"
import { BooksScreen } from "../Books/BooksScreen"
import { BookProjectScreen } from "../Books/BookProjectScreen"
import { ChapterEditor } from "../Books/ChapterEditor"
import { SettingsScreen } from "../Settings/SettingsScreen"
import { EditorOverlay } from "../Editor/EditorOverlay"
import { TemplateDocEditor } from "../Templates/TemplateDocEditor"
import { ScreenErrorBoundary } from "./ScreenErrorBoundary"
import { LeaveConfirmModal } from "./LeaveConfirmModal"
import { SyncConflictModal } from "./SyncConflictModal"
import { ReminderNotifier } from "./ReminderNotifier"
import { MynaPicksNotifier } from "./MynaPicksNotifier"
import { AlertModal } from "./AlertModal"
import { UpdateBanner } from "./UpdateBanner"

export function Layout() {
  const { activeModule, sidebarVisible } = useUiStore()
  const templateDoc = useUiStore((s) => s.templateDoc)
  const bookProjectId = useUiStore((s) => s.bookProjectId)
  const bookChapterId = useUiStore((s) => s.bookChapterId)
  const hasOnboarded = useAppStore((s) => s.settings.hasOnboarded)

  return (
    <div className="h-full w-full flex flex-col bg-paper">
      <div className="print:hidden">
        <TitleBar />
      </div>
      <div className="flex-1 flex min-h-0">
        {!hasOnboarded ? (
          <OnboardingScreen />
        ) : (
          <>
            {sidebarVisible && (
              <div className="print:hidden">
                <Sidebar />
              </div>
            )}
            <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin print:overflow-visible">
              {templateDoc ? (
                <TemplateDocEditor />
              ) : bookChapterId ? (
                <ChapterEditor />
              ) : bookProjectId ? (
                <BookProjectScreen />
              ) : (
                <ScreenErrorBoundary resetKey={activeModule}>
                  {activeModule === "home" && <HomeScreen />}
                  {activeModule === "notes" && <NotesScreen />}
                  {activeModule === "calendar" && <CalendarScreen />}
                  {activeModule === "school" && <SchoolScreen />}
                  {activeModule === "prompts" && <PromptsScreen />}
                  {activeModule === "mood" && <MoodScreen />}
                  {activeModule === "gratitude" && <GratitudeScreen />}
                  {activeModule === "letters" && <LettersScreen />}
                  {activeModule === "threads" && <ThreadsScreen />}
                  {activeModule === "stream" && <StreamScreen />}
                  {activeModule === "dialogue" && <DialogueScreen />}
                  {activeModule === "templates" && <TemplatesScreen />}
                  {activeModule === "movies" && <MoviesScreen />}
                  {activeModule === "books" && <BooksScreen />}
                  {activeModule === "settings" && <SettingsScreen />}
                </ScreenErrorBoundary>
              )}
            </main>
          </>
        )}
      </div>
      <EditorOverlay />
      <LeaveConfirmModal />
      <SyncConflictModal />
      <ReminderNotifier />
      <MynaPicksNotifier />
      <AlertModal />
      {hasOnboarded && <UpdateBanner />}
    </div>
  )
}
