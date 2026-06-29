import { toJpeg } from "html-to-image"

const palettes = [
  { bg: "linear-gradient(135deg, #fdf6ec 0%, #f6e3cf 100%)", ink: "#2a2118", accent: "#e8833f" },
  { bg: "linear-gradient(135deg, #eef3ff 0%, #dbe6ff 100%)", ink: "#1c2333", accent: "#4f7cff" },
  { bg: "linear-gradient(135deg, #f0f5f1 0%, #dbe9dd 100%)", ink: "#1c2a1f", accent: "#7c9885" },
  { bg: "linear-gradient(135deg, #161616 0%, #2a2a2a 100%)", ink: "#f4f1ea", accent: "#e8833f" },
]

export async function exportSelectionAsImage(text: string, appName: string, dir: "ltr" | "rtl" = "ltr") {
  const palette = palettes[Math.floor(Math.random() * palettes.length)]

  const card = document.createElement("div")
  card.style.position = "fixed"
  card.style.left = "-9999px"
  card.style.top = "0"
  card.style.width = "1080px"
  card.style.minHeight = "1080px"
  card.style.display = "flex"
  card.style.flexDirection = "column"
  card.style.justifyContent = "space-between"
  card.style.padding = "90px"
  card.style.background = palette.bg
  card.style.color = palette.ink
  card.style.fontFamily = dir === "rtl" ? "'Vazirmatn', sans-serif" : "'Fraunces', serif"
  card.style.direction = dir
  card.style.textAlign = dir === "rtl" ? "right" : "left"
  card.style.boxSizing = "border-box"

  const quoteMark = document.createElement("div")
  quoteMark.textContent = "“"
  quoteMark.style.fontSize = "120px"
  quoteMark.style.color = palette.accent
  quoteMark.style.lineHeight = "1"
  quoteMark.style.fontFamily = "Georgia, serif"
  if (dir !== "rtl") card.appendChild(quoteMark)

  const body = document.createElement("div")
  body.textContent = text
  body.style.fontSize = text.length > 220 ? "34px" : "46px"
  body.style.lineHeight = "1.5"
  body.style.fontWeight = "450"
  body.style.whiteSpace = "pre-wrap"
  body.style.flex = "1"
  body.style.display = "flex"
  body.style.alignItems = "center"
  card.appendChild(body)

  const footer = document.createElement("div")
  footer.style.display = "flex"
  footer.style.alignItems = "center"
  footer.style.gap = "12px"
  footer.style.opacity = "0.75"
  footer.style.fontFamily = "'Inter', sans-serif"
  footer.style.fontSize = "22px"
  footer.style.letterSpacing = "0.05em"

  const dot = document.createElement("div")
  dot.style.width = "10px"
  dot.style.height = "10px"
  dot.style.borderRadius = "50%"
  dot.style.background = palette.accent
  footer.appendChild(dot)

  const label = document.createElement("div")
  label.textContent = appName
  footer.appendChild(label)

  card.appendChild(footer)
  document.body.appendChild(card)

  try {
    const dataUrl = await toJpeg(card, { quality: 0.95, pixelRatio: 2 })
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const buf = await blob.arrayBuffer()
    return window.myna.exportFile.saveBuffer({
      defaultName: "myna-note.jpg",
      filters: [{ name: "JPEG Image", extensions: ["jpg", "jpeg"] }],
      buffer: buf,
    })
  } finally {
    document.body.removeChild(card)
  }
}
