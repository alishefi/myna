const gradients = [
  "from-amber-soft to-amber/40",
  "from-blue/25 to-blue/5",
  "from-sage/25 to-sage/5",
  "from-rose/25 to-rose/5",
  "from-amber/20 to-sage/10",
  "from-blue/20 to-rose/10",
]

export function gradientFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return gradients[hash % gradients.length]
}

const dateColors = [
  { bg: "bg-amber-soft", text: "text-amber" },
  { bg: "bg-blue/15", text: "text-blue" },
  { bg: "bg-sage/20", text: "text-sage" },
  { bg: "bg-rose/15", text: "text-rose" },
]

export function colorForDate(key: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return dateColors[hash % dateColors.length]
}

const entryColors = [
  { bg: "bg-amber-soft", text: "text-amber", dot: "bg-amber" },
  { bg: "bg-blue/15", text: "text-blue", dot: "bg-blue" },
  { bg: "bg-sage/20", text: "text-sage", dot: "bg-sage" },
  { bg: "bg-rose/15", text: "text-rose", dot: "bg-rose" },
]

export function colorForEntry(id: string): { bg: string; text: string; dot: string } {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return entryColors[hash % entryColors.length]
}
