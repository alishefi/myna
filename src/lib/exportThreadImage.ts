import { toJpeg } from "html-to-image"
import logo from "../assets/myna-logo.svg"

function randomPastel() {
  const hue = Math.floor(Math.random() * 360)
  const bg = `hsl(${hue}, 62%, 90%)`
  const accent = `hsl(${hue}, 55%, 48%)`
  const ink = `hsl(${hue}, 30%, 18%)`
  return { bg, accent, ink }
}

export async function exportThreadPostAsImage(text: string, appName: string, lang: "en" | "da", liked: boolean) {
  const palette = randomPastel()
  const chromeDir = lang === "da" ? "rtl" : "ltr"

  const card = document.createElement("div")
  card.style.position = "fixed"
  card.style.top = "0"
  card.style.left = "0"
  card.style.zIndex = "-1000"
  card.style.pointerEvents = "none"
  card.style.width = "1080px"
  card.style.height = "1080px"
  card.style.display = "flex"
  card.style.flexDirection = "column"
  card.style.justifyContent = "space-between"
  card.style.padding = "90px"
  card.style.background = palette.bg
  card.style.color = palette.ink
  card.style.fontFamily = lang === "da" ? "'Vazirmatn', sans-serif" : "'Fraunces', serif"
  card.dir = chromeDir
  card.style.boxSizing = "border-box"
  card.style.overflow = "hidden"

  const ring = document.createElement("div")
  ring.style.position = "absolute"
  ring.style.width = "420px"
  ring.style.height = "420px"
  ring.style.borderRadius = "50%"
  ring.style.border = `2px solid ${palette.accent}`
  ring.style.opacity = "0.18"
  ring.style.top = chromeDir === "rtl" ? "auto" : "-140px"
  ring.style.bottom = chromeDir === "rtl" ? "-140px" : "auto"
  ring.style.right = chromeDir === "rtl" ? "auto" : "-140px"
  ring.style.left = chromeDir === "rtl" ? "-140px" : "auto"
  card.appendChild(ring)

  const header = document.createElement("div")
  header.style.position = "relative"
  header.style.display = "flex"
  header.style.alignItems = "center"
  header.style.gap = "10px"
  header.style.opacity = "0.8"

  const logoImg = document.createElement("img")
  logoImg.src = logo
  logoImg.width = 28
  logoImg.height = 28
  header.appendChild(logoImg)

  const appLabel = document.createElement("div")
  appLabel.textContent = appName
  appLabel.style.fontFamily = "'Inter', sans-serif"
  appLabel.style.fontSize = "18px"
  appLabel.style.fontWeight = "600"
  appLabel.style.letterSpacing = "0.02em"
  header.appendChild(appLabel)

  card.appendChild(header)

  const body = document.createElement("div")
  body.textContent = text
  body.dir = "auto"
  body.style.position = "relative"
  body.style.fontSize = text.length > 220 ? "38px" : text.length > 100 ? "46px" : "56px"
  body.style.lineHeight = "1.5"
  body.style.fontWeight = "450"
  body.style.whiteSpace = "pre-wrap"
  body.style.flex = "1"
  body.style.display = "flex"
  body.style.alignItems = "center"
  body.style.margin = "56px 0"
  card.appendChild(body)

  const footer = document.createElement("div")
  footer.style.position = "relative"
  footer.style.display = "flex"
  footer.style.alignItems = "center"
  footer.style.justifyContent = "space-between"
  footer.style.opacity = "0.7"
  footer.style.fontFamily = "'Inter', sans-serif"
  footer.style.fontSize = "20px"
  footer.style.letterSpacing = "0.03em"

  const dateLabel = document.createElement("div")
  dateLabel.textContent = new Date().toLocaleDateString()
  footer.appendChild(dateLabel)

  if (liked) {
    const heart = document.createElement("div")
    heart.textContent = "♥"
    heart.style.color = palette.accent
    heart.style.fontSize = "26px"
    footer.appendChild(heart)
  }

  card.appendChild(footer)
  document.body.appendChild(card)

  try {
    await document.fonts.ready
    await logoImg.decode().catch(() => {})
    const dataUrl = await toJpeg(card, { quality: 0.95, pixelRatio: 2, backgroundColor: palette.bg })
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const buf = await blob.arrayBuffer()
    return window.myna.exportFile.saveBuffer({
      defaultName: "myna-thread.jpg",
      filters: [{ name: "JPEG Image", extensions: ["jpg", "jpeg"] }],
      buffer: buf,
    })
  } finally {
    document.body.removeChild(card)
  }
}
