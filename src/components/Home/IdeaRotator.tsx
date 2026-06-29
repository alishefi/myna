import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { writeIdeas } from "../../lib/quotes"
import { useI18n } from "../../i18n"

export function IdeaRotator() {
  const { lang } = useI18n()
  const [index, setIndex] = useState(0)
  const wordRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % writeIdeas.length)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!wordRef.current) return
    gsap.fromTo(
      wordRef.current,
      { opacity: 0, y: 8, filter: "blur(4px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }
    )
  }, [index])

  const word = writeIdeas[index][lang === "da" ? "da" : "en"]

  return (
    <div className="font-serif text-[56px] lg:text-[70px] leading-[1.05] text-ink-soft tracking-tight">
      {lang === "da" ? (
        <>
          بیایید یک <span ref={wordRef} className="text-ink font-semibold inline-block">{word}</span> بنویسیم
        </>
      ) : (
        <>
          Let&rsquo;s write a <span ref={wordRef} className="text-ink font-semibold inline-block">{word}</span>
        </>
      )}
    </div>
  )
}
