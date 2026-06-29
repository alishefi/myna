import { useEffect, useRef } from "react"
import gsap from "gsap"
import logoRaw from "../../assets/myna-logo.svg?raw"

export function AnimatedLogo({ size = 48, variant = "idle" }: { size?: number; variant?: "idle" | "confused" }) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    gsap.set(el, { transformOrigin: "50% 50%" })
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })

    if (variant === "confused") {
      const eyes = el.querySelectorAll("circle")
      eyes.forEach((eye) => gsap.set(eye, { transformOrigin: "50% 50%" }))
      tl.to(el, { rotate: -10, x: -2, duration: 0.6 })
        .to(el, { rotate: -7, duration: 0.5 })
        .to(eyes, { scaleY: 0.08, duration: 0.06, ease: "power1.in" }, "+=0.5")
        .to(eyes, { scaleY: 1, duration: 0.1, ease: "power1.out" })
        .to(el, { rotate: -9, duration: 0.8 })
        .to(el, { rotate: -7, x: -1, duration: 1.1 })
        .to(eyes, { scaleY: 0.08, duration: 0.06 }, "+=0.6")
        .to(eyes, { scaleY: 1, duration: 0.1 })
        .to(el, { rotate: 0, x: 0, duration: 0.7 })
      return () => {
        tl.kill()
      }
    }

    const eyes = el.querySelectorAll("circle")
    eyes.forEach((eye) => gsap.set(eye, { transformOrigin: "50% 50%" }))
    tl.to(eyes, { scaleY: 0.08, duration: 0.06, ease: "power1.in" }, "+=2.4")
      .to(eyes, { scaleY: 1, duration: 0.1, ease: "power1.out" })
      .to(eyes, { scaleY: 0.08, duration: 0.06, ease: "power1.in" }, "+=3.2")
      .to(eyes, { scaleY: 1, duration: 0.1, ease: "power1.out" })
    return () => {
      tl.kill()
    }
  }, [variant])

  return (
    <div
      ref={wrapRef}
      className="myna-animated-logo inline-block overflow-visible shrink-0"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: logoRaw }}
    />
  )
}
