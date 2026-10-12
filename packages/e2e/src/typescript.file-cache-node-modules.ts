import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.file-cache-node-modules'

export const test: Test = async ({ Command, FileSystem, Main, Settings }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'file' })
  const uri = `${root}/main.ts`
  const dependency = `${root}/node_modules/cache-test/index.d.ts`
  const lock = `${root}/node_modules/.package-lock.json`
  const text = "import { dependency } from 'cache-test';\nconst value: number = dependency;"
  await FileSystem.mkdir(`${root}/node_modules/cache-test`)
  await FileSystem.writeFile(
    `${root}/tsconfig.json`,
    JSON.stringify({
      compilerOptions: { lib: ['esnext'], module: 'commonjs', moduleResolution: 'node', types: [] },
      files: ['main.ts'],
    }),
  )
  await FileSystem.writeFile(lock, '{"lockfileVersion":3,"packages":{}}')
  await FileSystem.writeFile(`${root}/node_modules/cache-test/package.json`, '{"types":"index.d.ts"}')
  await FileSystem.writeFile(dependency, 'export declare const dependency: number;')
  await FileSystem.writeFile(uri, text)
  await Settings.update({ 'editor.diagnostics': false, 'typescript.cacheNodeModules': true })
  await Main.openUri(uri)

  const trace = async (expected: number) => {
    const result = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', { text, uri })) as any
    if (result.error || result.diagnostics?.count !== expected) {
      throw new Error(`Expected ${expected} diagnostics: ${JSON.stringify(result)}`)
    }
    return result
  }

  const initial = await trace(0)
  const warm = await trace(0)
  const identities = warm.fileCache.identitiesChecked - initial.fileCache.identitiesChecked
  const directoryCalls =
    (warm.syncRpc.methods['SyncApi.readDirSync']?.callCount || 0) -
    (initial.syncRpc.methods['SyncApi.readDirSync']?.callCount || 0)
  if (warm.fileCache.sourceReads !== initial.fileCache.sourceReads || identities > 3 || directoryCalls > 0) {
    throw new Error(`Unchanged dependencies were revalidated: ${JSON.stringify({ initial, warm })}`)
  }

  await FileSystem.writeFile(dependency, 'export declare const dependency: string;')
  await FileSystem.writeFile(lock, '{"lockfileVersion":3,"packages":{"cache-test":{"version":"2"}}}')
  const refreshed = await trace(1)
  if (
    refreshed.fileCache.sourceReads <= warm.fileCache.sourceReads &&
    refreshed.fileCache.dependencyHits <= warm.fileCache.dependencyHits
  ) {
    throw new Error(`Lockfile change did not reload dependency content: ${JSON.stringify({ refreshed, warm })}`)
  }
}
