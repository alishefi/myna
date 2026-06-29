import type { MoodValue } from "../../types"

const mouthPaths: Record<MoodValue, string> = {
  great: "M8 14 Q12 19 16 14",
  good: "M8 14.5 Q12 17.5 16 14.5",
  okay: "M8.5 15 H15.5",
  low: "M8 16 Q12 13 16 16",
  rough: "M8 16.5 Q12 12.5 16 16.5",
}

const eyeStyle: Record<MoodValue, "dot" | "happy" | "sad"> = {
  great: "happy",
  good: "dot",
  okay: "dot",
  low: "dot",
  rough: "sad",
}

export function MoodIcon({ mood, size = 24, className }: { mood: MoodValue; size?: number; className?: string }) {
  const eyes = eyeStyle[mood]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.6" />
      {eyes === "happy" && (
        <>
          <path d="M7 9 Q8.5 7 10 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 9 Q15.5 7 17 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {eyes === "dot" && (
        <>
          <circle cx="8.5" cy="9.5" r="1.1" fill="currentColor" />
          <circle cx="15.5" cy="9.5" r="1.1" fill="currentColor" />
        </>
      )}
      {eyes === "sad" && (
        <>
          <path d="M7 10 Q8.5 8.5 10 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 9.5 Q15.5 8.5 17 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      <path d={mouthPaths[mood]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}
