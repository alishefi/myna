import { Trash2 } from "lucide-react"

const PALETTE = [
  { bg: "from-amber/10 to-amber/[0.04]", icon: "text-amber" },
  { bg: "from-blue/10 to-blue/[0.04]", icon: "text-blue" },
  { bg: "from-sage/10 to-sage/[0.04]", icon: "text-sage" },
  { bg: "from-rose/10 to-rose/[0.04]", icon: "text-rose" },
]

export function TemplateCard({
  icon: Icon,
  name,
  description,
  onClick,
  onDelete,
  index = 0,
}: {
  icon: typeof Trash2
  name: string
  description: string
  onClick: () => void
  onDelete?: () => void
  index?: number
}) {
  const { bg, icon } = PALETTE[index % PALETTE.length]

  return (
    <div className="group relative rounded-2xl border border-line bg-paper-raised overflow-hidden hover:border-ink/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {onDelete && (
        <button
          type="button"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="no-drag absolute top-3 right-3 z-10 w-8 h-8 rounded-lg grid place-items-center bg-paper-raised/90 text-ink-soft/60 opacity-0 group-hover:opacity-100 hover:text-rose hover:bg-rose/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
      <button type="button" onClick={onClick} className="no-drag w-full h-full text-left flex flex-col">
        <div className={`h-36 shrink-0 bg-gradient-to-br ${bg} grid place-items-center overflow-hidden`}>
          <div className="w-14 h-14 rounded-2xl bg-paper-raised shadow-sm grid place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <Icon size={24} className={icon} />
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-[14.5px] font-semibold text-ink mb-1 truncate">{name}</div>
          <p className="text-[12.5px] text-ink-soft leading-snug line-clamp-3">{description}</p>
        </div>
      </button>
    </div>
  )
}
