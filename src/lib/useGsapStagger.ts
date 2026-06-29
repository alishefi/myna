import { useEffect, useRef } from "react"
import gsap from "gsap"

export function useGsapStagger<T extends HTMLElement = HTMLDivElement>(selector = ".anim-item") {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const items = ref.current.querySelectorAll(selector)
    gsap.fromTo(
      items,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }
    )
  }, [selector])

  return ref
}
