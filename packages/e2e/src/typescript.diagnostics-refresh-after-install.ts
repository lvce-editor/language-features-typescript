import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-refresh-after-install'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'file' })
  const uri = `${root}/main.ts`
  const write = (path: string, content: string) =>
    Command.execute('WebView.compatSharedProcessInvoke', 'FileSystemDisk.writeFile', path, content)
  await write(`${root}/tsconfig.json`, JSON.stringify({ compilerOptions: { module: 'NodeNext', types: ['node'] } }))
  await write(
    uri,
    'import { readFile } from "node:fs/promises";\nexport const value: string = 1;\nexport { readFile };\n',
  )
  await Settings.update({ 'editor.diagnostics': true, 'files.workspaceWatcher.enabled': false })
  await Workspace.setUri(root)
  await Main.openUri(uri)
  await Command.execute('Editor.waitForDiagnostics')
  const errors = Locator('.Editor .DiagnosticError')
  await expect(errors).toHaveCount(2)

  const types = `${root}/node_modules/@types/node`
  await Command.execute('WebView.compatSharedProcessInvoke', 'FileSystemDisk.mkdir', types)
  await write(`${types}/package.json`, '{"name":"@types/node","types":"index.d.ts"}')
  await write(`${types}/index.d.ts`, 'declare module "node:fs/promises" { export const readFile: unknown }\n')
  await expect(errors).toHaveCount(1)
}
