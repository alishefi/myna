import { useEffect, useRef } from "react"
import { useI18n } from "../../i18n"

export function MynaPicksNotifier() {
  const { t } = useI18n()
  const indexRef = useRef(0)

  useEffect(() => {
    const picks = [
      { title: t.home.promptOfDay, body: t.home.freshPromptNotifBody },
      { title: t.home.moodCheckIn, body: t.home.moodCheckInSub },
      { title: t.home.gratitudeQuick, body: t.home.gratitudeQuickSub },
      { title: t.home.unsentLetters, body: t.home.unsentLettersSub },
      { title: t.home.streamWriting, body: t.home.streamWritingSub },
      { title: t.home.dialogueWriting, body: t.home.dialogueWritingSub },
    ]

    const fire = () => {
      const pick = picks[indexRef.current % picks.length]
      indexRef.current += 1
      window.myna?.notify.show({ title: `${t.home.mynaPicksLabel} · ${pick.title}`, body: pick.body })
    }

    let timeoutId: number
    const scheduleNext = () => {
      const delay = (45 + Math.random() * 30) * 60 * 1000 // 45-75 minutes
      timeoutId = window.setTimeout(() => {
        fire()
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => window.clearTimeout(timeoutId)
  }, [t])

  return null
}
