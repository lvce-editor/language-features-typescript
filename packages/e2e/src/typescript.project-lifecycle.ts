import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.project-lifecycle'

export const test: Test = async ({ Command, FileSystem, Main, Settings, Workspace }) => {
  const tmp = await FileSystem.getTmpDir()
  const uri = `${tmp}/main.ts`
  const dependency = `${tmp}/value.ts`
  const text = "import { value } from './value.ts'\nexport const result: number = value\n"
  await FileSystem.writeFile(
    `${tmp}/tsconfig.json`,
    JSON.stringify({
      compilerOptions: { allowImportingTsExtensions: true, noEmit: true, types: [] },
      files: ['main.ts', 'value.ts'],
    }),
  )
  await FileSystem.writeFile(uri, text)
  await FileSystem.writeFile(dependency, 'export const value: number = 42\n')
  await Settings.update({ 'typescript.maxIdleProjects': 0, 'typescript.projectIdleTimeout': 0 })
  await Workspace.setUri(tmp)
  await Main.openUri(uri)
  const first = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', { text, uri })) as any
  if (first.error || first.diagnostics.count !== 0)
    throw new Error(`Initial diagnostics failed: ${JSON.stringify(first)}`)
  await Main.closeAllEditors()
  const retired = (await Command.executeExtensionCommand('typescript.getProjectCacheStatistics', {
    waitForIdle: true,
  })) as any
  if (retired.projects !== 0 || retired.documentOverrides !== 0)
    throw new Error(`Failed to retire: ${JSON.stringify(retired)}`)
  await FileSystem.writeFile(dependency, 'export const value: string = "changed while closed"\n')
  await Main.openUri(uri)
  const reopened = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', { text, uri })) as any
  if (reopened.error || reopened.diagnostics.count !== 1)
    throw new Error(`Reopened project read stale disk content: ${JSON.stringify(reopened)}`)
}
