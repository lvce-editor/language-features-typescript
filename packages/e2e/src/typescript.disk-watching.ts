import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.disk-watching'

const diskMethods = [
  'FileCache.getHashes',
  'FileCache.getValidation',
  'SyncApi.exists',
  'SyncApi.readDirSync',
  'SyncApi.readFileSync',
  'SyncApi.getDirectoriesSync',
]

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'file' })
  const uri = `${root}/main.ts`
  const source = `${root}/value.ts`
  const config = `${root}/tsconfig.json`
  const text = "import { value } from './value';\nconst result: number = value;"
  const externalWrite = (path: string, content: string) =>
    Command.execute('WebView.compatSharedProcessInvoke', 'FileSystemDisk.writeFile', path, content)
  const externalRename = (from: string, to: string) =>
    Command.execute('WebView.compatSharedProcessInvoke', 'FileSystemDisk.rename', from, to)
  const writeConfig = async (strict: boolean) => {
    await externalWrite(
      config,
      JSON.stringify({
        compilerOptions: { lib: ['esnext'], strict, types: [] },
        files: ['main.ts'],
      }),
    )
  }
  await writeConfig(false)
  await FileSystem.writeFile(uri, text)
  await Settings.update({ 'editor.diagnostics': false, 'files.workspaceWatcher.enabled': false })
  await Workspace.setUri(root)
  await Main.openUri(uri)

  const trace = async (expected: number, documentText = text) => {
    const deadline = Date.now() + 5000
    let result: any
    do {
      result = await Command.executeExtensionCommand('typescript.showPerformanceTrace', { text: documentText, uri })
    } while (!result.error && result.diagnostics?.count !== expected && Date.now() < deadline)
    if (result.error || result.diagnostics?.count !== expected) {
      throw new Error(`Expected ${expected} disk diagnostics: ${JSON.stringify(result)}`)
    }
    return result
  }

  // Watch readiness precedes cache trust, including initially missing imports.
  await trace(1)
  await externalWrite(source, 'export const value = 1;')
  await trace(0)
  const initial = await trace(0)
  for (let index = 0; index < 3; index++) {
    await Main.openUri(uri)
    await Editor.setCursor(1, 24)
    await Editor.openHover()
    const hover = Locator('.EditorHover')
    await expect(hover).toContainText('value')
    const warm = await trace(0)
    for (const method of diskMethods) {
      if ((warm.fileCache.transport?.[method] || 0) !== (initial.fileCache.transport?.[method] || 0)) {
        throw new Error(`Warm hover/diagnostics probed ${method}: ${JSON.stringify({ initial, warm })}`)
      }
    }
    if (
      (warm.fileCache.transport?.['FileCache.getWatchState'] || 0) <=
      (initial.fileCache.transport?.['FileCache.getWatchState'] || 0)
    ) {
      throw new Error('Warm requests did not consult the disk watcher revision')
    }
  }

  await externalWrite(source, 'export const value = "external";')
  await trace(1)
  await trace(0, text.replace('result: number', 'result: string'))
  await externalWrite(source, 'export const value = 1;')
  await trace(0)
  await externalRename(source, `${root}/renamed.ts`)
  await trace(1)
  await externalRename(`${root}/renamed.ts`, source)
  await trace(0)
  await externalWrite(source, 'export const value = null;')
  await trace(0)
  await writeConfig(true)
  await trace(1)
  await writeConfig(false)
  await trace(0)

  // Switching workspaces must discard the old session and acquire fresh watches.
  const nextRoot = await FileSystem.getTmpDir({ scheme: 'file' })
  const nextUri = `${nextRoot}/main.ts`
  await FileSystem.writeFile(nextUri, 'export const value = 1;')
  await Workspace.setUri(nextRoot)
  await Main.openUri(nextUri)
  const next = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', {
    text: 'export const value = 1;',
    uri: nextUri,
  })) as any
  if (next.error || next.diagnostics?.count !== 0) throw new Error(`Workspace switch failed: ${JSON.stringify(next)}`)
  const nextWarm = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', {
    text: 'export const value = 1;',
    uri: nextUri,
  })) as any
  if ((nextWarm.fileCache.transport?.['FileCache.getWatchState'] || 0) <= 0)
    throw new Error('Workspace switch did not reacquire disk watching')
}
