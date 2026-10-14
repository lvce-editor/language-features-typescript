import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.disk-watching-ancestor-config'

export const test: Test = async ({ Command, FileSystem, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'file' })
  const workspace = `${root}/project`
  const uri = `${workspace}/main.ts`
  const text = 'export const value: number = null;'
  await FileSystem.mkdir(workspace)
  await FileSystem.writeFile(uri, text)
  await Settings.update({ 'editor.diagnostics': false, 'files.workspaceWatcher.enabled': false })
  await Workspace.setUri(workspace)
  await Main.openUri(uri)
  const trace = async (expected: number) => {
    const deadline = Date.now() + 5000
    let result: any
    do {
      result = await Command.executeExtensionCommand('typescript.showPerformanceTrace', { text, uri })
    } while (!result.error && result.diagnostics?.count !== expected && Date.now() < deadline)
    if (result.error || result.diagnostics?.count !== expected) {
      throw new Error(`Expected ${expected} ancestor config diagnostics: ${JSON.stringify(result)}`)
    }
    return result
  }
  await trace(1)
  const initial = await trace(1)
  if ((initial.fileCache.transport?.['FileCache.getWatchState'] || 0) <= 0) throw new Error('Disk watcher not active')
  // Creating an initially absent config above the workspace needs shallow-parent
  // coverage; a direct chokidar watch of that missing file does not deliver it.
  await Command.execute(
    'WebView.compatSharedProcessInvoke',
    'FileSystemDisk.writeFile',
    `${root}/tsconfig.json`,
    JSON.stringify({
      compilerOptions: { strict: false, types: [] },
      files: ['project/main.ts'],
    }),
  )
  await trace(0)
  await Command.execute(
    'WebView.compatSharedProcessInvoke',
    'FileSystemDisk.writeFile',
    `${root}/tsconfig.json`,
    JSON.stringify({
      compilerOptions: { strict: true, types: [] },
      files: ['project/main.ts'],
    }),
  )
  await trace(1)
}
