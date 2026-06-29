import { useState, type ReactNode } from "react"
import { Eye, EyeOff, Check, Info, Download, Upload, Coffee, AtSign, MapPin, Languages, User, HardDriveDownload, KeyRound, Cloud, History, Sparkles } from "lucide-react"
import clsx from "clsx"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import { ScreenHeader } from "../shared/ScreenHeader"
import { Logo } from "../shared/Logo"

function GroupLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft/50 px-1">{children}</div>
}

function SectionLabel({ icon: Icon, children }: { icon: typeof Check; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-ink-soft/70 shrink-0" />
      <label className="text-[13px] font-medium text-ink-soft">{children}</label>
    </div>
  )
}

export function SettingsScreen() {
  const { t } = useI18n()
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const exportBackup = useAppStore((s) => s.exportBackup)
  const restoreFromBackup = useAppStore((s) => s.restoreFromBackup)
  const [showOmdbKey, setShowOmdbKey] = useState(false)
  const [backupStatus, setBackupStatus] = useState<string | null>(null)

  const flashStatus = (msg: string) => {
    setBackupStatus(msg)
    setTimeout(() => setBackupStatus(null), 2500)
  }

  const handleExportBackup = async () => {
    const data = exportBackup()
    const buffer = new TextEncoder().encode(JSON.stringify(data, null, 2))
    const today = new Date().toISOString().slice(0, 10)
    const res = await window.myna.backup.export({ defaultName: `myna-backup-${today}.json`, buffer })
    if (!res.canceled) flashStatus(t.settings.backupSaved)
  }

  const handleImportBackup = async () => {
    const res = await window.myna.backup.import()
    if (res.canceled) return
    if (res.error || !res.data) {
      flashStatus(t.settings.backupImportError)
      return
    }
    if (!window.confirm(t.settings.backupImportConfirm)) return
    restoreFromBackup(res.data)
    flashStatus(t.settings.backupRestored)
  }

  return (
    <div className="p-12 w-full">
      <ScreenHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1400px]">
        <div className="space-y-10">
          <div className="space-y-4">
            <GroupLabel>{t.settings.groupGeneral}</GroupLabel>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <SectionLabel icon={Languages}>{t.settings.language}</SectionLabel>
              <div className="flex gap-2 bg-black/4 rounded-full p-1 w-fit mt-3">
                <button
                  type="button"
                  onClick={() => updateSettings({ lang: "en" })}
                  className={clsx("text-[14px] font-medium px-5 py-2 rounded-full transition-colors", settings.lang === "en" ? "bg-paper-raised text-ink border border-line" : "text-ink-soft")}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ lang: "da" })}
                  className={clsx("text-[14px] font-medium px-5 py-2 rounded-full transition-colors", settings.lang === "da" ? "bg-paper-raised text-ink border border-line" : "text-ink-soft")}
                >
                  دری
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <label className="text-[13px] font-medium text-ink-soft block mb-1">{t.settings.theme}</label>
              <p className="text-[13px] text-ink-soft leading-relaxed mb-4">{t.settings.themeHint}</p>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { value: "light", label: t.settings.themeLight, swatch: "bg-[#faf8f5]" },
                    { value: "dark", label: t.settings.themeDark, swatch: "bg-[#17181b]" },
                    { value: "system", label: t.settings.themeSystem, swatch: "bg-gradient-to-br from-[#faf8f5] to-[#17181b]" },
                  ] as const
                ).map((opt) => {
                  const active = settings.theme === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateSettings({ theme: opt.value })}
                      className={clsx(
                        "no-drag relative rounded-xl border-2 p-2.5 flex flex-col items-center gap-2 transition-colors",
                        active ? "border-ink" : "border-line hover:border-ink/30"
                      )}
                    >
                      {active && (
                        <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-ink text-paper grid place-items-center">
                          <Check size={11} />
                        </span>
                      )}
                      <div className={clsx("w-full h-12 rounded-lg border border-line/60", opt.swatch)} />
                      <span className="text-[12.5px] font-medium text-ink">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <SectionLabel icon={User}>{t.settings.name}</SectionLabel>
              <input
                value={settings.userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                placeholder={t.settings.namePlaceholder}
                className="w-full bg-paper border border-line rounded-xl px-4 py-3 text-[15px] outline-none focus:border-ink/30 mt-3"
              />
            </section>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-ink-soft/70 shrink-0" />
                  <div>
                    <div className="text-[13.5px] font-medium text-ink">{t.settings.dialogueHistory}</div>
                    <p className="text-[12.5px] text-ink-soft leading-relaxed mt-0.5">{t.settings.dialogueHistoryHint}</p>
                  </div>
                </div>
                <button
                  type="button"
                  title={t.settings.dialogueHistory}
                  onClick={() => updateSettings({ dialogueHistory: !settings.dialogueHistory })}
                  className={clsx(
                    "no-drag shrink-0 w-11 h-6.5 rounded-full relative transition-colors",
                    settings.dialogueHistory ? "bg-ink" : "bg-black/15"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-paper-raised transition-transform",
                      settings.dialogueHistory && "translate-x-[18px]"
                    )}
                  />
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <GroupLabel>{t.settings.groupData}</GroupLabel>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <SectionLabel icon={HardDriveDownload}>{t.settings.backupTitle}</SectionLabel>
              <p className="text-[13px] text-ink-soft leading-relaxed mt-1.5 mb-4">{t.settings.backupHint}</p>
              <div className="flex flex-wrap gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="no-drag inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
                >
                  <Download size={15} />
                  {t.settings.backupExport}
                </button>
                <button
                  type="button"
                  onClick={handleImportBackup}
                  className="no-drag inline-flex items-center gap-2 border border-line text-ink px-4 py-2.5 rounded-full text-[13.5px] font-medium hover:border-ink/30 transition-colors"
                >
                  <Upload size={15} />
                  {t.settings.backupImport}
                </button>
                {backupStatus && <span className="text-[13px] text-sage self-center">{backupStatus}</span>}
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-[12.5px] text-ink-soft leading-relaxed mb-2.5">{t.settings.cloudHint}</p>
                <div className="flex gap-2">
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-drag text-[12.5px] font-medium text-ink-soft hover:text-ink border border-line rounded-full px-3.5 py-1.5"
                  >
                    {t.settings.openDrive}
                  </a>
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-drag text-[12.5px] font-medium text-ink-soft hover:text-ink border border-line rounded-full px-3.5 py-1.5"
                  >
                    {t.settings.openGmail}
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <GroupLabel>{t.settings.groupAi}</GroupLabel>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <Info size={15} className="text-amber shrink-0" />
                <label className="text-[13px] font-medium text-ink-soft">{t.settings.aiAvailability}</label>
              </div>
              <p className="text-[13px] text-ink-soft leading-relaxed">{t.settings.aiAvailabilityHint}</p>
            </section>
          </div>

          <div className="space-y-4">
            <GroupLabel>{t.settings.groupIntegrations}</GroupLabel>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <SectionLabel icon={KeyRound}>{t.settings.omdbApiKey}</SectionLabel>
              <div className="relative mt-3">
                <input
                  type={showOmdbKey ? "text" : "password"}
                  value={settings.omdbApiKey}
                  onChange={(e) => updateSettings({ omdbApiKey: e.target.value })}
                  placeholder={t.settings.namePlaceholder}
                  className="w-full bg-paper border border-line rounded-xl px-4 py-3 pr-12 text-[15px] outline-none focus:border-ink/30 font-mono"
                />
                <button
                  type="button"
                  title={showOmdbKey ? t.settings.hideKey : t.settings.showKey}
                  onClick={() => setShowOmdbKey((s) => !s)}
                  className="no-drag absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  {showOmdbKey ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="text-[13px] text-ink-soft mt-2.5 leading-relaxed">{t.settings.omdbApiKeyHint}</p>
            </section>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <SectionLabel icon={Cloud}>{t.settings.googleDriveOptional}</SectionLabel>
              <p className="text-[13px] text-ink-soft leading-relaxed mt-1.5 mb-3">{t.settings.googleDriveDescription}</p>
              <div className="space-y-2.5">
                <input
                  value={settings.googleDriveClientId}
                  onChange={(e) => updateSettings({ googleDriveClientId: e.target.value })}
                  placeholder={t.settings.googleOAuthClientIdPlaceholder}
                  className="w-full bg-paper border border-line rounded-xl px-4 py-2.5 text-[13.5px] outline-none focus:border-ink/30 font-mono"
                />
                <input
                  value={settings.googleDriveApiKey}
                  onChange={(e) => updateSettings({ googleDriveApiKey: e.target.value })}
                  placeholder={t.settings.googleApiKeyPlaceholder}
                  className="w-full bg-paper border border-line rounded-xl px-4 py-2.5 text-[13.5px] outline-none focus:border-ink/30 font-mono"
                />
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <GroupLabel>{t.settings.groupAbout}</GroupLabel>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <div className="flex items-center gap-4 mb-4">
                <Logo size={38} withName={false} />
                <div>
                  <div className="text-[16px] font-medium text-ink">{t.appName}</div>
                  <div className="text-[13px] text-ink-soft">{t.help.version} 0.1.0</div>
                </div>
              </div>
              <p className="text-[13px] text-ink-soft leading-relaxed flex gap-2">
                <Sparkles size={14} className="text-amber shrink-0 mt-0.5" />
                <span>{t.settings.aboutMynaText}</span>
              </p>
            </section>

            <section className="rounded-2xl border border-line bg-paper-raised p-6">
              <label className="text-[13px] font-medium text-ink-soft block mb-2">{t.settings.aboutDeveloper}</label>
              <div className="flex items-center gap-1.5 text-[13px] text-ink-soft mb-4">
                <MapPin size={13} className="shrink-0" />
                {t.settings.developerBio}
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://buymeacoffee.com/alishefi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-drag inline-flex items-center gap-2 bg-amber text-paper px-4 py-2.5 rounded-full text-[13.5px] font-medium hover:opacity-90 transition-opacity"
                >
                  <Coffee size={15} />
                  {t.settings.buyMeCoffee}
                </a>
                <a
                  href="https://instagram.com/_alishefi_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-drag inline-flex items-center gap-2 border border-line text-ink px-4 py-2.5 rounded-full text-[13.5px] font-medium hover:border-ink/30 transition-colors"
                >
                  <AtSign size={15} />
                  _alishefi_
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
