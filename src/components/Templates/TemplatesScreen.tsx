import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Plus, FileText } from "lucide-react"
import { useAppStore } from "../../store/appStore"
import { useUiStore } from "../../store/uiStore"
import { useI18n } from "../../i18n"
import { docTemplates } from "./templateDocs"
import { TemplateCard } from "./TemplateCard"
import { TemplatePromptBar } from "./TemplatePromptBar"

export function TemplatesScreen() {
  const { t } = useI18n()
  const createNote = useAppStore((s) => s.createNote)
  const customTemplates = useAppStore((s) => s.customTemplates)
  const createCustomTemplate = useAppStore((s) => s.createCustomTemplate)
  const deleteCustomTemplate = useAppStore((s) => s.deleteCustomTemplate)
  const openTemplateDoc = useUiStore((s) => s.openTemplateDoc)
  const openTemplateBlueprint = useUiStore((s) => s.openTemplateBlueprint)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const cards = sectionRef.current.querySelectorAll(".anim-item")
    gsap.fromTo(cards, { opacity: 0, y: 22, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.04, ease: "back.out(1.5)", delay: 0.1 })
  }, [])

  const useDocTemplate = (content: object) => {
    const note = createNote({ content: JSON.stringify(content), tags: ["template-doc"] })
    openTemplateDoc(note.id)
  }

  const createBlankTemplate = () => {
    const tpl = createCustomTemplate({
      content: JSON.stringify({ type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: t.templates.untitledTemplate }] }, { type: "paragraph" }] }),
    })
    openTemplateBlueprint(tpl.id)
  }

  return (
    <div ref={sectionRef} className="p-10 lg:p-14 w-full max-w-[1200px] mx-auto">
      <div className="w-full flex flex-col items-center text-center mb-8">
        <h1 className="mt-3 font-serif text-[40px] lg:text-[48px] font-medium text-ink leading-[1.1] mb-3">{t.templates.screenTitle}</h1>
        <p className="text-[15px] text-ink-soft max-w-[480px]">{t.templates.screenSubtitle}</p>
      </div>

      <div className="w-full flex justify-center">
        <TemplatePromptBar />
      </div>

      {customTemplates.length > 0 && (
        <>
          <div className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide mb-4">{t.templates.yourTemplates}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-12">
            {customTemplates.map((tpl, i) => (
              <div key={tpl.id} className="anim-item">
                <TemplateCard
                  icon={FileText}
                  name={tpl.name || t.templates.untitledTemplate}
                  description={t.templates.ownTemplateDescription}
                  onClick={() => openTemplateBlueprint(tpl.id)}
                  onDelete={() => deleteCustomTemplate(tpl.id)}
                  index={i}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide mb-4">{t.templates.browseTemplates}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div className="anim-item">
          <button
            type="button"
            onClick={createBlankTemplate}
            className="no-drag w-full h-full min-h-[212px] rounded-2xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-2 text-ink-soft hover:border-ink/25 hover:text-ink transition-colors"
          >
            <Plus size={20} />
            <span className="text-[13px] font-medium">{t.templates.newTemplate}</span>
          </button>
        </div>
        {docTemplates.map((tpl, i) => (
          <div key={tpl.key} className="anim-item">
            <TemplateCard icon={tpl.icon} name={tpl.name} description={tpl.description} onClick={() => useDocTemplate(tpl.content)} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}
