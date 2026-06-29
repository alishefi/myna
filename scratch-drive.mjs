import { _electron as electron } from 'playwright-core'
import path from 'node:path'
import fs from 'node:fs'

const APP_DIR = 'd:\\08_vscode\\Myna note talking app'
const SHOT_DIR = path.join(APP_DIR, 'scratch-shots')
fs.mkdirSync(SHOT_DIR, { recursive: true })

const consoleLogs = []

async function main() {
  const app = await electron.launch({
    executablePath: path.join(APP_DIR, 'node_modules', 'electron', 'dist', 'electron.exe'),
    args: [APP_DIR],
    timeout: 30000,
  })
  await new Promise((r) => setTimeout(r, 4000))
  const page = app.windows().find((w) => !w.url().startsWith('devtools://')) ?? (await app.firstWindow())
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => consoleLogs.push(`[pageerror] ${err.message}\n${err.stack}`))

  await page.screenshot({ path: path.join(SHOT_DIR, '01-start.png') })
  console.log('windows:', app.windows().map((w) => w.url()))

  const clickText = async (text) => {
    return page.evaluate((t) => {
      const els = [...document.querySelectorAll('button, a, [role="button"], div, span')]
      const el = els.find((e) => e.textContent?.trim() === t) ?? els.find((e) => e.children.length === 0 && e.textContent?.includes(t))
      if (!el) return 'NOT_FOUND:' + t
      el.click()
      return 'OK:' + t
    }, text)
  }

  console.log(await clickText('Books'))
  await new Promise((r) => setTimeout(r, 1000))
  await page.screenshot({ path: path.join(SHOT_DIR, '02-books.png') })

  console.log('BODY TEXT SNIPPET:', (await page.evaluate(() => document.body.innerText)).slice(0, 2000))

  await new Promise((r) => setTimeout(r, 500))
  console.log('CONSOLE LOGS:\n' + consoleLogs.join('\n'))

  await app.close()
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
