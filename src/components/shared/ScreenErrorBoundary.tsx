import { Component, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { useUiStore } from "../../store/uiStore"

function BackToHomeButton() {
  const setActiveModule = useUiStore((s) => s.setActiveModule)
  return (
    <button
      type="button"
      onClick={() => setActiveModule("home")}
      className="no-drag mt-4 bg-ink text-paper px-5 py-2.5 rounded-full text-[13.5px] font-medium hover:bg-amber transition-colors"
    >
      Back to Home
    </button>
  )
}

interface State {
  error: Error | null
}

export class ScreenErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
          <AlertTriangle size={28} className="text-rose mb-4" />
          <div className="text-[16px] font-medium text-ink mb-1.5">This page hit an error.</div>
          <p className="text-[13.5px] text-ink-soft max-w-[420px] mb-1">{this.state.error.message}</p>
          <BackToHomeButton />
        </div>
      )
    }
    return this.props.children
  }
}
