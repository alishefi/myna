import { useEffect, useState } from "react"
import { Minus, Square, Copy, X } from "lucide-react"
import { Logo } from "./Logo"
import { MenuBar } from "./MenuBar"
import { useI18n } from "../../i18n"

export function TitleBar() {
  const { t } = useI18n()
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.myna.win.isMaximized().then(setMaximized)
    return window.myna.win.onMaximizeChanged(setMaximized)
  }, [])

  return (
    <div dir="ltr" className="drag h-10 flex items-center justify-between pl-4 pr-0 shrink-0 select-none border-b border-line/60 bg-paper-raised/60">
      <div className="flex items-center gap-3 h-full">
        <Logo size={17} />
        <MenuBar />
      </div>
      <div className="no-drag flex items-center h-full">
        <button
          type="button"
          title={t.window.minimize}
          onClick={() => window.myna.win.minimize()}
          className="h-10 w-11 grid place-items-center text-ink-soft hover:bg-black/5 transition-colors"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          title={maximized ? t.window.restore : t.window.maximize}
          onClick={() => window.myna.win.maximize()}
          className="h-10 w-11 grid place-items-center text-ink-soft hover:bg-black/5 transition-colors"
        >
          {maximized ? <Copy size={12} className="-scale-x-100" /> : <Square size={12} />}
        </button>
        <button
          type="button"
          title={t.window.close}
          onClick={() => window.myna.win.close()}
          className="h-10 w-11 grid place-items-center text-ink-soft hover:bg-rose hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
