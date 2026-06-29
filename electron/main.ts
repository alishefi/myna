import { app, BrowserWindow, ipcMain, dialog, shell, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { GEMINI_API_KEY } from './secrets'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

// GitHub repo Myna checks for newer releases. Change this to your own
// "owner/repo" once you publish releases there; the in-app update banner
// reads the latest release tag (e.g. "v0.2.0") and compares it to this build.
const GITHUB_REPO = 'alishefi/myna'

// Returns >0 if a>b, <0 if a<b, 0 if equal. Tolerates a leading "v" and
// extra/missing segments. Pre-release suffixes are ignored (numeric core only).
function compareVersions(a: string, b: string): number {
  const parse = (v: string) => v.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0)
  const pa = parse(a)
  const pb = parse(b)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d !== 0) return d
  }
  return 0
}

let win: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let trayHintShown = false

// The renderer owns the i18n dictionary; main.ts only ever needs this handful
// of strings (tray, file dialogs, backup/import errors) so a tiny inline
// dictionary is simpler than wiring main.ts into the full i18n system.
let currentLang: 'en' | 'da' = 'en'

const STRINGS = {
  en: {
    trayTooltip: 'Myna',
    trayStillRunningTitle: 'Myna is still running',
    trayStillRunningBody: 'Myna minimized to the system tray. Click the tray icon to reopen, or right-click it to quit.',
    trayOpen: 'Open Myna',
    trayQuit: 'Quit',
    backupFilterName: 'Myna Backup',
    noteFilterName: 'Myna Note',
    backupReadError: 'That file could not be read as a Myna backup.',
    noteReadError: 'That file could not be read as a Myna note.',
  },
  da: {
    trayTooltip: 'Ù…ÛŒÙ†Ø§',
    trayStillRunningTitle: 'Ù…ÛŒÙ†Ø§ Ù‡Ù†ÙˆØ² Ø¯Ø± Ø­Ø§Ù„ Ø§Ø¬Ø±Ø§Ø³Øª',
    trayStillRunningBody: 'Ù…ÛŒÙ†Ø§ Ø¨Ù‡ Ø³ÛŒÙ†ÛŒ Ø³ÛŒØ³ØªÙ… Ú©ÙˆÚ†Ú© Ø´Ø¯. Ø¨Ø±Ø§ÛŒ Ø¨Ø§Ø²Ú©Ø±Ø¯Ù† Ø¯ÙˆØ¨Ø§Ø±Ù‡ Ø±ÙˆÛŒ Ø¢ÛŒÚ©Ù† Ø³ÛŒÙ†ÛŒ Ú©Ù„ÛŒÚ© Ú©Ù†ÛŒØ¯ØŒ ÛŒØ§ Ø¨Ø±Ø§ÛŒ Ø®Ø±ÙˆØ¬ Ø±ÙˆÛŒ Ø¢Ù† Ø±Ø§Ø³Øªâ€ŒÚ©Ù„ÛŒÚ© Ú©Ù†ÛŒØ¯.',
    trayOpen: 'Ø¨Ø§Ø²Ú©Ø±Ø¯Ù† Ù…ÛŒÙ†Ø§',
    trayQuit: 'Ø®Ø±ÙˆØ¬',
    backupFilterName: 'Ø¨Ú©Ø§Ù¾ Ù…ÛŒÙ†Ø§',
    noteFilterName: 'ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Ù…ÛŒÙ†Ø§',
    backupReadError: 'Ø§ÛŒÙ† ÙØ§ÛŒÙ„ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø¨Ú©Ø§Ù¾ Ù…ÛŒÙ†Ø§ Ø®ÙˆØ§Ù†Ø¯Ù‡ Ù†Ø´Ø¯.',
    noteReadError: 'Ø§ÛŒÙ† ÙØ§ÛŒÙ„ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Ù…ÛŒÙ†Ø§ Ø®ÙˆØ§Ù†Ø¯Ù‡ Ù†Ø´Ø¯.',
  },
} as const

function s() {
  return STRINGS[currentLang]
}

// Inlined as a rasterized PNG data URL (not loaded from disk) so the icon
// survives packaging without an extra asset-copy build step, and so it
// renders reliably: nativeImage decodes PNG/JPEG/BMP but does not reliably
// rasterize SVG across platforms. Mirrors src/assets/myna-logo.svg at 256x256.
const appIconDataUrl =
  'data:image/png;base64,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'

const GEMINI_MODEL = 'gemini-2.5-flash'

// Google blocks/filters the Gemini API in some countries â€” that shows up either
// as a network-level failure (request never reaches Google) or a clean
// "location not supported" API rejection. Both cases land here, so every AI
// feature in the app shows the same actionable message instead of a raw error.
const VPN_REQUIRED_MESSAGE = "Gemini AI isn't available in your country right now. Turn on a VPN (connect to a supported region) and try again."

async function callGemini(opts: { system: string; prompt: string; maxTokens?: number }, attempt = 0): Promise<{ text?: string; error?: string }> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
        systemInstruction: { parts: [{ text: opts.system }] },
        generationConfig: { maxOutputTokens: opts.maxTokens ?? 1024, thinkingConfig: { thinkingBudget: 0 } },
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      const status = json?.error?.status
      if ((status === 'UNAVAILABLE' || res.status === 503) && attempt < 2) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        return callGemini(opts, attempt + 1)
      }
      return { error: VPN_REQUIRED_MESSAGE }
    }
    const text = json.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
    return { text }
  } catch {
    return { error: VPN_REQUIRED_MESSAGE }
  }
}

// Keep the development build's data fully separate from a real installed copy.
// Otherwise running `npm run dev` writes into the same Documents\Myna folder the
// shipped app reads from, so test notes (and a completed-onboarding flag) leak
// into a "fresh" install. Packaged builds use Documents\Myna; dev uses a sibling.
const dataDir = path.join(app.getPath('documents'), app.isPackaged ? 'Myna' : 'Myna (dev)')
const notesFile = path.join(dataDir, 'data.json')

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

async function readData() {
  try {
    const raw = await fs.readFile(notesFile, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeData(data: unknown) {
  await ensureDataDir()
  await fs.writeFile(notesFile, JSON.stringify(data, null, 2), 'utf-8')
}

async function statMtimeMs(file: string): Promise<number | null> {
  try {
    const st = await fs.stat(file)
    return st.mtimeMs
  } catch {
    return null
  }
}

// Tracks the on-disk modification time we last knew about, so a save can
// detect if something else (another running instance, a restored backup, a
// cloud-sync client watching the Documents folder) wrote the file in the
// meantime, instead of silently clobbering it.
let lastKnownMtimeMs: number | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    show: false,
    backgroundColor: '#faf8f5',
    frame: false,
    icon: nativeImage.createFromDataURL(appIconDataUrl),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win?.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (VITE_DEV_SERVER_URL && url.startsWith(VITE_DEV_SERVER_URL)) return
    event.preventDefault()
    shell.openExternal(url)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('close', (e) => {
    if (isQuitting) return
    e.preventDefault()
    win?.hide()
    if (!trayHintShown) {
      trayHintShown = true
      tray?.displayBalloon({
        title: s().trayStillRunningTitle,
        content: s().trayStillRunningBody,
      })
    }
  })
}

function rebuildTrayMenu() {
  if (!tray) return
  tray.setToolTip(s().trayTooltip)
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: s().trayOpen,
        click: () => {
          win?.show()
          win?.focus()
        },
      },
      { type: 'separator' },
      {
        label: s().trayQuit,
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])
  )
}

function createTray() {
  const icon = nativeImage.createFromDataURL(appIconDataUrl)
  // Provide a 32px image (not 16): Windows downscales crisply for the 16px
  // taskbar slot and the larger tray-overflow flyout, so the badge stays sharp.
  tray = new Tray(icon.resize({ width: 32, height: 32 }))
  rebuildTrayMenu()
  tray.on('click', () => {
    if (!win) return
    if (!win.isVisible()) win.show()
    win.focus()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  ipcMain.handle('myna:data:load', async () => {
    const data = await readData()
    lastKnownMtimeMs = await statMtimeMs(notesFile)
    return data ?? null
  })

  ipcMain.handle('myna:data:save', async (_e, data, opts?: { force?: boolean }) => {
    const currentMtimeMs = await statMtimeMs(notesFile)
    if (!opts?.force && lastKnownMtimeMs !== null && currentMtimeMs !== null && currentMtimeMs > lastKnownMtimeMs) {
      const remote = await readData()
      return { ok: false, conflict: true, remote: remote ?? null }
    }
    await writeData(data)
    lastKnownMtimeMs = await statMtimeMs(notesFile)
    return { ok: true }
  })

  ipcMain.handle('myna:notify:show', async (_e, opts: { title: string; body: string }) => {
    if (!Notification.isSupported()) return { shown: false }
    const notification = new Notification({ title: opts.title, body: opts.body })
    notification.on('click', () => {
      if (!win) return
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    })
    notification.show()
    return { shown: true }
  })

  ipcMain.handle('myna:export:saveBuffer', async (_e, opts: { defaultName: string; filters: { name: string; extensions: string[] }[]; buffer: ArrayBuffer | Uint8Array }) => {
    const result = await dialog.showSaveDialog(win!, {
      defaultPath: opts.defaultName,
      filters: opts.filters,
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    const buf = Buffer.from(opts.buffer as ArrayBuffer)
    await fs.writeFile(result.filePath, buf)
    return { canceled: false, filePath: result.filePath }
  })

  ipcMain.handle('myna:export:revealInFolder', async (_e, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('myna:backup:export', async (_e, opts: { defaultName: string; buffer: ArrayBuffer | Uint8Array }) => {
    const result = await dialog.showSaveDialog(win!, {
      defaultPath: path.join(app.getPath('desktop'), opts.defaultName),
      filters: [{ name: s().backupFilterName, extensions: ['json'] }],
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    const buf = Buffer.from(opts.buffer as ArrayBuffer)
    await fs.writeFile(result.filePath, buf)
    return { canceled: false, filePath: result.filePath }
  })

  ipcMain.handle('myna:backup:import', async () => {
    if (!win) return { canceled: true }
    const result = await dialog.showOpenDialog(win, {
      filters: [{ name: s().backupFilterName, extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (result.canceled || !result.filePaths[0]) return { canceled: true }
    try {
      const raw = await fs.readFile(result.filePaths[0], 'utf-8')
      return { data: JSON.parse(raw) }
    } catch {
      return { error: s().backupReadError }
    }
  })

  ipcMain.handle('myna:ai:call', async (_e, opts: { system: string; prompt: string; maxTokens?: number }) => {
    try {
      return await callGemini(opts)
    } catch {
      return { error: VPN_REQUIRED_MESSAGE }
    }
  })

  ipcMain.handle('myna:movies:search', async (_e, opts: { apiKey: string; query: string }) => {
    if (!opts.apiKey) return { error: 'missing-key' }
    try {
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(opts.apiKey)}&type=movie&s=${encodeURIComponent(opts.query)}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.Response === 'False') return { results: [] }
      const results = (json.Search ?? []).slice(0, 8).map((r: { imdbID: string; Title: string; Year: string; Poster: string }) => ({
        imdbID: r.imdbID,
        title: r.Title,
        year: r.Year,
        poster: r.Poster && r.Poster !== 'N/A' ? r.Poster : undefined,
      }))
      return { results }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown-error' }
    }
  })

  ipcMain.handle('myna:movies:lookup', async (_e, opts: { apiKey: string; imdbID: string }) => {
    if (!opts.apiKey) return { error: 'missing-key' }
    try {
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(opts.apiKey)}&i=${encodeURIComponent(opts.imdbID)}&plot=short`
      const res = await fetch(url)
      const json = await res.json()
      if (json.Response === 'False') return { error: json.Error ?? 'not-found' }
      return {
        movie: {
          imdbID: json.imdbID,
          title: json.Title,
          year: json.Year,
          poster: json.Poster && json.Poster !== 'N/A' ? json.Poster : undefined,
          imdbRating: json.imdbRating && json.imdbRating !== 'N/A' ? Number(json.imdbRating) : undefined,
          plot: json.Plot && json.Plot !== 'N/A' ? json.Plot : undefined,
          genre: json.Genre && json.Genre !== 'N/A' ? json.Genre : undefined,
        },
      }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown-error' }
    }
  })

  ipcMain.handle('myna:menu:importNote', async () => {
    if (!win) return { canceled: true }
    const result = await dialog.showOpenDialog(win, {
      filters: [{ name: s().noteFilterName, extensions: ['myna'] }],
      properties: ['openFile'],
    })
    if (result.canceled || !result.filePaths[0]) return { canceled: true }
    try {
      const raw = await fs.readFile(result.filePaths[0], 'utf-8')
      return { note: JSON.parse(raw) }
    } catch {
      return { error: s().noteReadError }
    }
  })

  ipcMain.handle('myna:menu:showInfo', async (_e, opts: { title: string; message: string; detail: string }) => {
    if (!win) return
    await dialog.showMessageBox(win, { type: 'info', title: opts.title, message: opts.message, detail: opts.detail })
  })

  ipcMain.handle('myna:app:getVersion', () => app.getVersion())
  ipcMain.handle('myna:updates:check', async () => {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Myna' },
      })
      if (!res.ok) return { available: false }
      const rel = (await res.json()) as { tag_name?: string; name?: string; html_url?: string; body?: string }
      const latest = rel.tag_name || rel.name
      if (!latest) return { available: false }
      const available = compareVersions(latest, app.getVersion()) > 0
      return {
        available,
        version: latest.replace(/^v/i, ''),
        url: rel.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`,
        notes: rel.body || '',
      }
    } catch {
      // Offline / blocked / repo not found — silently report no update.
      return { available: false }
    }
  })
  ipcMain.on('myna:updates:open', (_e, url: string) => {
    if (typeof url === 'string' && /^https:\/\/github\.com\//.test(url)) shell.openExternal(url)
  })
  ipcMain.on('myna:app:setLang', (_e, lang: 'en' | 'da') => {
    currentLang = lang === 'da' ? 'da' : 'en'
    rebuildTrayMenu()
  })

  ipcMain.on('myna:win:minimize', () => win?.minimize())
  ipcMain.on('myna:win:maximize', () => (win?.isMaximized() ? win.unmaximize() : win?.maximize()))
  ipcMain.on('myna:win:close', () => win?.close())
  ipcMain.handle('myna:win:isMaximized', () => win?.isMaximized() ?? false)
  ipcMain.on('myna:win:toggleFullscreen', () => win?.setFullScreen(!win.isFullScreen()))
  ipcMain.on('myna:win:zoomIn', () => win?.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5))
  ipcMain.on('myna:win:zoomOut', () => win?.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5))
  ipcMain.on('myna:win:zoomReset', () => win?.webContents.setZoomLevel(0))

  ipcMain.on('myna:edit:cut', () => win?.webContents.cut())
  ipcMain.on('myna:edit:copy', () => win?.webContents.copy())
  ipcMain.on('myna:edit:paste', () => win?.webContents.paste())

  win!.on('maximize', () => win?.webContents.send('myna:win:maximizeChanged', true))
  win!.on('unmaximize', () => win?.webContents.send('myna:win:maximizeChanged', false))
})
