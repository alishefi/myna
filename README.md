<div align="center">

# 🐦 Myna

**A calm, all-in-one desktop space for note-taking, journaling, and writing.**

Myna brings your notes, calendar, journals, mood check-ins, letters, and even your
book manuscripts together in one quiet, beautifully designed app — fully bilingual
(English & Dari/دری) with right-to-left support, dark mode, and a few thoughtful
AI touches. It runs entirely on your computer; your writing stays in your own
Documents folder.

### ⬇️ Download

**[Download Myna for Windows (0.1.0)](https://github.com/alishefi/myna/releases/download/v0.1.0/Myna.Setup.0.1.0.exe)**

Windows 10/11 · 64-bit · ~220 MB installer

</div>

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 📝 | **Notes** | A rich text editor with headings, lists, tables, highlights, images, and math — for everyday writing. |
| 🏠 | **Home dashboard** | Your day at a glance: recent notes, what's upcoming, the prompt of the day, and a quick mood check-in. |
| 📅 | **Calendar** | Plan and see your events and entries across the month. |
| 🎓 | **School** | Organize classes, notebooks, and flashcards for studying. |
| ✍️ | **Daily Prompts** | A fresh writing prompt each day to get the words flowing. |
| 💚 | **Mood & Well-Being** | Track how you're really feeling over time. |
| 🙏 | **Gratitude** | Note one thing you're thankful for, day by day. |
| 💌 | **Unsent Letters** | Write the letters you'll never send — say what you needed to say. |
| 🧵 | **Threads** | Quick, short posts you can like, reply to, repost, and even save as a shareable image card. |
| ⏱️ | **Stream Writing** | Set a timer and free-write without overthinking. |
| 💬 | **Dialogue Writing** | Have a written conversation with the other part of you (AI-assisted). |
| 🎬 | **Movies** | Track films and get recommendations. |
| 📚 | **Writer's Room** | A home for serious writing — book projects, chapters, characters, and word-count progress. |
| 🧩 | **Templates** | Reusable document templates to start faster. |

### And throughout the app

- 🌍 **Bilingual** — full **English** and **Dari (دری)** with automatic right-to-left layout
- 🌙 **Dark & light themes** — pick your mood (dark by default)
- 🤖 **A few AI touches** — dialogue, smart ideas, and recommendations (powered by Google Gemini)
- 📤 **Export** — save your work as **PDF**, **Word (.docx)**, or **images**
- 💾 **Offline & private** — everything is stored locally in your `Documents/Myna` folder
- 🔔 **Stays out of the way** — minimizes to the system tray and keeps running in the background
- ⬆️ **Update notices** — tells you when a newer version is available

---

## 📦 Installing

1. Download the installer from the link above.
2. Run **`Myna Setup 0.1.0.exe`**.
3. Windows may show a *"Windows protected your PC"* screen (the app isn't code-signed yet) —
   click **More info → Run anyway**.
4. On first launch, pick your language and name, take the quick tour, and you're in.

---

## 🛠️ Built with

[Electron](https://www.electronjs.org/) · [React 19](https://react.dev/) ·
[TypeScript](https://www.typescriptlang.org/) · [Tailwind CSS v4](https://tailwindcss.com/) ·
[Zustand](https://github.com/pmndrs/zustand) · [TipTap](https://tiptap.dev/) ·
[GSAP](https://gsap.com/) · [Vite](https://vitejs.dev/)

## 🚀 Building from source

```bash
npm install

# AI features need a Google Gemini key:
# copy electron/secrets.example.ts -> electron/secrets.ts and paste your key
cp electron/secrets.example.ts electron/secrets.ts

npm run dev      # run in development
npm run build    # build the Windows installer (output in dist/)
```

---

<div align="center">
Made with care · Myna
</div>
