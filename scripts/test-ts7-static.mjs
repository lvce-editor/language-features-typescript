import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { chromium } from 'playwright'

// Serve the actual Pages artifact, with no COOP/COEP headers, backend, or
// service-worker workaround. This exercises the editor and its OPFS RPC path.
const root = resolve('dist')
const prefix = '/language-features-typescript'
const testName = process.env.TS_WEB_TEST ?? 'typescript.ts7-web'
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.css': 'text/css',
}
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost')
    if (!url.pathname.startsWith(prefix + '/')) {
      response.writeHead(404).end()
      return
    }
    const path = resolve(root, '.' + decodeURIComponent(url.pathname.slice(prefix.length)))
    if (!path.startsWith(root + sep)) {
      response.writeHead(403).end()
      return
    }
    const file = path.endsWith(sep) ? path + 'index.html' : path
    const contents = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(contents)
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
let browser
const messages = []
const failedRequests = []
const start = performance.now()
try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_EXECUTABLE_PATH && { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }),
    headless: true,
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('console', (message) => messages.push(`${message.type()}: ${message.text()}`))
  page.on('pageerror', (error) => messages.push(`pageerror: ${error.stack}`))
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() })
  })
  const url = `http://127.0.0.1:${server.address().port}${prefix}/tests/${testName}.html`
  await page.goto(url)
  assert.equal(await page.evaluate(() => crossOriginIsolated), false)
  const overlay = page.locator('#TestOverlay')
  await overlay.waitFor({ state: 'visible', timeout: 120_000 })
  assert.equal(await overlay.getAttribute('data-state'), 'pass', await overlay.textContent())
  const worker = JSON.parse(
    messages.find((message) => message.includes('TS7_METRICS '))?.split('TS7_METRICS ')[1] ?? 'null',
  )
  const result = {
    compilerVersion: worker?.compilerVersion,
    crossOriginIsolated: false,
    durationMs: performance.now() - start,
    failedRequests,
    memory: await page.evaluate(() =>
      performance.memory ? { usedJSHeapSize: performance.memory.usedJSHeapSize } : null,
    ),
    test: testName,
    worker,
  }
  await mkdir('.tmp/ts7-results', { recursive: true })
  await page.screenshot({ path: '.tmp/ts7-results/static-chrome.png', fullPage: true })
  await writeFile('.tmp/ts7-results/static-chrome.json', JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
} finally {
  await mkdir('.tmp/ts7-results', { recursive: true })
  await writeFile('.tmp/ts7-results/browser.log', messages.join('\n'))
  await writeFile('.tmp/ts7-results/failed-requests.json', JSON.stringify(failedRequests, null, 2))
  await browser?.close()
  await new Promise((resolve) => server.close(resolve))
}
