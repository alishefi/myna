import clsx from "clsx"
import {
  Home,
  FileText,
  Calendar,
  Lightbulb,
  Smile,
  HeartHandshake,
  Mail,
  MessageCircle,
  Timer,
  MessageSquare,
  GraduationCap,
  LayoutTemplate,
  Clapperboard,
  BookOpen,
  Settings as SettingsIcon,
} from "lucide-react"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import type { ModuleKey } from "../../types"
import { useGsapEntrance } from "../../lib/useGsapEntrance"
import { SidebarSlider } from "./SidebarSlider"
import { UpcomingReminders } from "./UpcomingReminders"

const workspaceItems: { key: ModuleKey; icon: typeof Home }[] = [
  { key: "home", icon: Home },
  { key: "notes", icon: FileText },
  { key: "calendar", icon: Calendar },
  { key: "books", icon: BookOpen },
  { key: "school", icon: GraduationCap },
]

const reflectItems: { key: ModuleKey; icon: typeof Home }[] = [
  { key: "prompts", icon: Lightbulb },
  { key: "mood", icon: Smile },
  { key: "gratitude", icon: HeartHandshake },
  { key: "letters", icon: Mail },
  { key: "threads", icon: MessageCircle },
  { key: "stream", icon: Timer },
  { key: "dialogue", icon: MessageSquare },
]

const libraryItems: { key: ModuleKey; icon: typeof Home }[] = [
  { key: "templates", icon: LayoutTemplate },
  { key: "movies", icon: Clapperboard },
]

const navLabel: Record<ModuleKey, keyof ReturnType<typeof useI18n>["t"]["nav"]> = {
  home: "home",
  notes: "notes",
  editor: "notes",
  calendar: "calendar",
  school: "school",
  prompts: "prompts",
  mood: "mood",
  gratitude: "gratitude",
  letters: "letters",
  threads: "threads",
  stream: "stream",
  dialogue: "dialogue",
  templates: "templates",
  movies: "movies",
  books: "books",
  settings: "settings",
}

function NavGroup({
  label,
  items,
  active,
  onSelect,
}: {
  label: string
  items: { key: ModuleKey; icon: typeof Home }[]
  active: ModuleKey
  onSelect: (k: ModuleKey) => void
}) {
  const { t } = useI18n()
  return (
    <div className="mb-5">
      <div className="text-[11px] font-semibold text-ink-soft/60 uppercase tracking-wider px-3 mb-1.5">{label}</div>
      <div className="flex flex-col gap-1">
        {items.map(({ key, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={clsx(
                "no-drag flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] transition-colors text-left",
                isActive ? "bg-black/[0.06] text-ink font-medium" : "text-ink-soft hover:bg-black/[0.04] hover:text-ink"
              )}
            >
              <Icon size={18} strokeWidth={2} className="opacity-75 shrink-0" />
              <span className="truncate">{t.nav[navLabel[key]]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Sidebar() {
  const { activeModule, setActiveModule } = useUiStore()
  const { t } = useI18n()
  const ref = useGsapEntrance<HTMLElement>({ from: { x: -12 } })

  return (
    <aside ref={ref} className="w-[276px] shrink-0 h-full flex flex-col px-3.5 pt-5 pb-4 border-r border-line/60 bg-paper-raised/40">
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <NavGroup label={t.sidebarNav.workspace} items={workspaceItems} active={activeModule} onSelect={setActiveModule} />
        <NavGroup label={t.sidebarNav.reflect} items={reflectItems} active={activeModule} onSelect={setActiveModule} />
        <NavGroup label={t.sidebarNav.library} items={libraryItems} active={activeModule} onSelect={setActiveModule} />
      </div>
      <SidebarSlider />
      <UpcomingReminders />
      <div className="pt-3 border-t border-line/60 shrink-0">
        <button
          type="button"
          onClick={() => setActiveModule("settings")}
          className={clsx(
            "no-drag w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] transition-colors text-left",
            activeModule === "settings" ? "bg-black/[0.06] text-ink font-medium" : "text-ink-soft hover:bg-black/[0.04] hover:text-ink"
          )}
        >
          <SettingsIcon size={18} strokeWidth={2} className="opacity-75" />
          {t.nav.settings}
        </button>
      </div>
    </aside>
  )
}
