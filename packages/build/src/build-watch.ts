import { execa } from 'execa'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { watch } from 'node:fs'
import { getTypeScriptLibManifest } from './getTypeScriptLibManifest.ts'
import { replaceTypeScriptLibManifest } from './replaceTypeScriptLibManifest.ts'
import { root } from './root.ts'

const main = async (): Promise<void> => {
  const binaryName: string = 'esbuild'
  const esbuildPath: string = join(root, 'node_modules', 'esbuild', 'bin', binaryName)
  const workerBundlePath = join(root, 'packages', 'typescript-worker', 'dist', 'typescriptWorkerMain.js')
  const typeScriptLibManifest = await getTypeScriptLibManifest(join(root, 'node_modules', 'typescript', 'lib'))
  const workerDistPath = join(root, 'packages', 'typescript-worker', 'dist')
  await mkdir(workerDistPath, { recursive: true })
  watch(workerDistPath, (_eventType, fileName) => {
    if (fileName === 'typescriptWorkerMain.js') {
      void replaceTypeScriptLibManifest(workerBundlePath, typeScriptLibManifest)
    }
  })
  execa(
    esbuildPath,
    [
      '--format=esm',
      '--bundle',
      '--external:electron',
      '--external:node:*',
      '--watch',
      'packages/extension/src/languageFeaturesTypeScriptMain.ts',
      '--outfile=packages/extension/dist/languageFeaturesTypeScriptMain.js',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
  execa(
    esbuildPath,
    [
      '--format=esm',
      '--bundle',
      '--watch',
      'packages/typescript-worker/src/typescriptWorkerMain.ts',
      '--outfile=packages/typescript-worker/dist/typescriptWorkerMain.js',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
}

main()
