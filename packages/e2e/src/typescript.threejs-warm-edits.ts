import type { Test } from '@lvce-editor/test-with-playwright'

// cspell:words threejs
export const name = 'typescript.threejs-warm-edits'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const root = await FileSystem.loadFixture(import.meta.resolve('../fixtures/threejs'))
  await Workspace.setUri(root)
  await Settings.update({ 'editor.diagnostics': false })
  const uri = `${root}/main.ts`
  await Main.openUri(uri)
  const text = await FileSystem.readFile(uri)
  const trace = async (value: string) => {
    const result = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', {
      text: value,
      uri,
    })) as any
    if (result.error || result.diagnostics.count !== 0) throw new Error(JSON.stringify(result))
    return result
  }
  let previous = await trace(text)
  if (previous.loadedFileCount < 200)
    throw new Error(`Expected real Three.js declaration graph: ${JSON.stringify(previous)}`)
  for (let i = 0; i < 5; i++) {
    const next = await trace(text.replace("'blue'", () => `'blue${i}'`))
    if (next.compilerVersion !== previous.compilerVersion || next.loadedFileCount < 200) {
      throw new Error(`Three.js declaration graph lost after a text edit: ${JSON.stringify(next)}`)
    }
    previous = next
  }
  await Main.openUri(uri)
  await Settings.update({ 'editor.diagnostics': true })
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])
  await Editor.setCursor(2, 'material.color.set'.length)
  await Editor.openCompletion()
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  await expect(completions).toContainText('setHex')
}
