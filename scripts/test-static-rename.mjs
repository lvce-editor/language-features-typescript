import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { firefox } from 'playwright'

// Exercise the built Pages runtime without cross-origin isolation. The ordinary
// Firefox e2e server enables shared memory and cannot catch OPFS lock failures.
const root = resolve('dist')
const prefix = '/language-features-typescript'
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' }
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost')
    if (!url.pathname.startsWith(prefix + '/')) return response.writeHead(404).end()
    const path = resolve(root, '.' + decodeURIComponent(url.pathname.slice(prefix.length)))
    if (!path.startsWith(root + sep)) return response.writeHead(403).end()
    const file = path.endsWith(sep) ? path + 'index.html' : path
    const contents = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
    response.end(contents)
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
let browser
const messages = []
try {
  browser = await firefox.launch({ headless: true })
  for (const test of ['typescript.rename', 'typescript.rename-cross-file']) {
    const context = await browser.newContext()
    try {
      const page = await context.newPage()
      page.on('console', (message) => messages.push(`${message.type()}: ${message.text()}`))
      page.on('pageerror', (error) => messages.push(error.stack))
      await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/tests/${test}.html`)
      assert.equal(await page.evaluate(() => crossOriginIsolated), false)
      const overlay = page.locator('#TestOverlay')
      await overlay.waitFor({ state: 'visible', timeout: 120_000 })
      assert.equal(await overlay.getAttribute('data-state'), 'pass', await overlay.textContent())
      console.log(`PASS non-isolated Firefox: ${test}`)
    } finally {
      await context.close()
    }
  }
} finally {
  await mkdir('.tmp/static-rename', { recursive: true })
  await writeFile('.tmp/static-rename/browser.log', messages.join('\n'))
  await browser?.close()
  await new Promise((resolve) => server.close(resolve))
}
