import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('myna', {
  data: {
    load: () => ipcRenderer.invoke('myna:data:load'),
    save: (data: unknown, opts?: { force?: boolean }) => ipcRenderer.invoke('myna:data:save', data, opts),
  },
  notify: {
    show: (opts: { title: string; body: string }) => ipcRenderer.invoke('myna:notify:show', opts),
  },
  exportFile: {
    saveBuffer: (opts: { defaultName: string; filters: { name: string; extensions: string[] }[]; buffer: ArrayBuffer | Uint8Array }) =>
      ipcRenderer.invoke('myna:export:saveBuffer', opts),
    revealInFolder: (filePath: string) => ipcRenderer.invoke('myna:export:revealInFolder', filePath),
  },
  backup: {
    export: (opts: { defaultName: string; buffer: ArrayBuffer | Uint8Array }) => ipcRenderer.invoke('myna:backup:export', opts),
    import: () => ipcRenderer.invoke('myna:backup:import'),
  },
  ai: {
    call: (opts: { system: string; prompt: string; maxTokens?: number }) => ipcRenderer.invoke('myna:ai:call', opts),
  },
  movies: {
    search: (opts: { apiKey: string; query: string }) => ipcRenderer.invoke('myna:movies:search', opts),
    lookup: (opts: { apiKey: string; imdbID: string }) => ipcRenderer.invoke('myna:movies:lookup', opts),
  },
  win: {
    minimize: () => ipcRenderer.send('myna:win:minimize'),
    maximize: () => ipcRenderer.send('myna:win:maximize'),
    close: () => ipcRenderer.send('myna:win:close'),
    isMaximized: () => ipcRenderer.invoke('myna:win:isMaximized'),
    onMaximizeChanged: (cb: (isMaximized: boolean) => void) => {
      const listener = (_e: unknown, val: boolean) => cb(val)
      ipcRenderer.on('myna:win:maximizeChanged', listener)
      return () => ipcRenderer.removeListener('myna:win:maximizeChanged', listener)
    },
    toggleFullscreen: () => ipcRenderer.send('myna:win:toggleFullscreen'),
    zoomIn: () => ipcRenderer.send('myna:win:zoomIn'),
    zoomOut: () => ipcRenderer.send('myna:win:zoomOut'),
    zoomReset: () => ipcRenderer.send('myna:win:zoomReset'),
  },
  edit: {
    cut: () => ipcRenderer.send('myna:edit:cut'),
    copy: () => ipcRenderer.send('myna:edit:copy'),
    paste: () => ipcRenderer.send('myna:edit:paste'),
  },
  menu: {
    importNote: () => ipcRenderer.invoke('myna:menu:importNote'),
    showInfo: (opts: { title: string; message: string; detail: string }) => ipcRenderer.invoke('myna:menu:showInfo', opts),
  },
  app: {
    version: () => ipcRenderer.invoke('myna:app:getVersion'),
    setLang: (lang: 'en' | 'da') => ipcRenderer.send('myna:app:setLang', lang),
  },
  updates: {
    check: () =>
      ipcRenderer.invoke('myna:updates:check') as Promise<{ available: boolean; version?: string; url?: string; notes?: string }>,
    open: (url: string) => ipcRenderer.send('myna:updates:open', url),
  },
})
