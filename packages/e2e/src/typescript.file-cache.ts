import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.file-cache'

const run = async ({ Command, FileSystem, Main, Settings }: Parameters<Test>[0], scheme: 'file' | 'memfs') => {
  const root = await FileSystem.getTmpDir({ scheme })
  try {
    await FileSystem.mkdir(`${root}/node_modules/cache-test`)
    const uri = `${root}/main.ts`
    const dependency = `${root}/node_modules/cache-test/index.d.ts`
    const source = `${root}/value.ts`
    const text = `import { value } from './value'; import { dependency } from 'cache-test';\nconst a: number = value; const b: number = dependency;`
    await FileSystem.writeFile(
      `${root}/tsconfig.json`,
      JSON.stringify({
        compilerOptions: { lib: ['esnext'], module: 'commonjs', moduleResolution: 'node', types: [] },
        files: ['main.ts', 'value.ts'],
      }),
    )
    await FileSystem.writeFile(`${root}/node_modules/cache-test/package.json`, '{"types":"index.d.ts"}')
    await FileSystem.writeFile(dependency, 'export declare const dependency: number;')
    await FileSystem.writeFile(source, 'export const value = 1;')
    await FileSystem.writeFile(uri, text)
    await Settings.update({ 'editor.diagnostics': false })
    await Main.openUri(uri)
    const trace = async (count: number, documentText = text) => {
      const result = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', {
        text: documentText,
        uri,
      })) as any
      if (result.error || result.diagnostics?.count !== count) {
        throw new Error(`Expected ${count} diagnostics: ${JSON.stringify(result)}`)
      }
      if (!result.fileCache?.generalEnabled || !result.fileCache?.dependenciesEnabled) {
        throw new Error(`Expected both OPFS caches enabled: ${JSON.stringify(result)}`)
      }
      return result
    }
    const initial = await trace(0)
    await FileSystem.writeFile(source, 'export const value = "changed";')
    const changed = await trace(1)
    if (
      changed.fileCache.dependencyHits <= initial.fileCache.dependencyHits ||
      changed.fileCache.generalHits <= initial.fileCache.generalHits
    ) {
      throw new Error(`Expected unchanged contents from both caches: ${JSON.stringify({ changed, initial })}`)
    }
    await FileSystem.writeFile(dependency, 'export declare const dependency: string;')
    await trace(2)
    if (scheme === 'file') await FileSystem.rename(source, `${root}/removed-value.ts`)
    else await FileSystem.remove(source)
    await trace(2)
    await FileSystem.writeFile(source, 'export const value = 1;')
    await trace(1)
    // An unsaved document must override the still-invalid saved assignment.
    await trace(0, text.replace('const b: number', 'const b: string'))
    await FileSystem.writeFile(dependency, 'export declare const dependency: number;')
    const restored = await trace(0)
    const warm = await trace(0)
    if (
      warm.fileCache.sourceReads !== restored.fileCache.sourceReads ||
      warm.fileCache.identitiesChecked <= restored.fileCache.identitiesChecked
    ) {
      throw new Error(`Expected identity checks without source reads: ${JSON.stringify({ restored, warm })}`)
    }
  } finally {
    // Disk fixtures live in the OS temporary directory. The public remove API
    // uses the desktop trash service, unavailable in headless environments.
    if (scheme === 'memfs') await FileSystem.remove(root)
  }
}

export const test: Test = (context) => run(context, 'memfs')
export const testDisk: Test = (context) => run(context, 'file')
