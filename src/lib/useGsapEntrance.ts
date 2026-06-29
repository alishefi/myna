import { useEffect, useRef } from "react"
import gsap from "gsap"

interface Options {
  from?: gsap.TweenVars
  duration?: number
  delay?: number
}

export function useGsapEntrance<T extends HTMLElement = HTMLDivElement>(opts: Options = {}) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10, ...opts.from },
      { opacity: 1, y: 0, x: 0, duration: opts.duration ?? 0.45, delay: opts.delay ?? 0, ease: "power3.out" }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
