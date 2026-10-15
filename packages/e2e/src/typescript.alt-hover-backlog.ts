import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.alt-hover-backlog'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'file' })
  const uri = `${root}/main.js`
  const text = 'first();\nsecond();\nfunction first() {}\nfunction second() {}'
  await FileSystem.writeFile(
    `${root}/tsconfig.json`,
    JSON.stringify({ compilerOptions: { allowJs: true, checkJs: true, lib: ['esnext'], types: [] } }),
  )
  await Promise.all(
    Array.from({ length: 100 }, (_, index) =>
      FileSystem.writeFile(`${root}/module${index}.js`, `export const value${index} = ${index};`),
    ),
  )
  await FileSystem.writeFile(uri, text)
  await Settings.update({ 'editor.diagnostics': false })
  await Workspace.setUri(root)
  const trace = async () => {
    const result = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', { text, uri })) as any
    if (result.error || result.diagnostics?.count !== 0) throw new Error(JSON.stringify(result))
    return result
  }
  await Main.openUri(uri)
  const cold = await trace()
  if (cold.languageService.fileCount < 101) throw new Error('Expected the large JavaScript project')
  await Main.openUri(uri)
  await Editor.setCursor(0, 2)
  await Editor.openHover()
  const hover = Locator('.EditorHover')
  await expect(hover).toContainText('function first')
  const initial = await trace()
  await Main.openUri(uri)
  const start = Date.now()
  await Promise.all(
    Array.from({ length: 30 }, (_, index) => Command.execute('Editor.handleMouseMove', 0, index % 2 ? 0 : 25, true)),
  )
  const definitionLink = Locator('.Token.EditorGoToDefinitionLink')
  await expect(definitionLink).toHaveText('first')
  if (Date.now() - start >= 10_000) throw new Error('Alt-hover burst stalled for ten seconds')
  const warm = await trace()
  if (warm.languageService.cache !== 'reused') throw new Error('Warm Alt-hover recreated its project')
  for (const method of [
    'SyncApi.readDirSync',
    'SyncApi.getDirectoriesSync',
    'SyncApi.readFileSync',
    'FileCache.getHashes',
  ]) {
    if ((warm.fileCache.transport?.[method] || 0) !== (initial.fileCache.transport?.[method] || 0)) {
      throw new Error(`Warm Alt-hover probed ${method}: ${JSON.stringify({ initial, warm })}`)
    }
  }
}
