import { execa } from 'execa'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { watch } from 'node:fs'
import { getTypeScriptLibManifest } from './getTypeScriptLibManifest.ts'
import { replaceTypeScriptLibManifest } from './replaceTypeScriptLibManifest.ts'
import { root } from './root.ts'

const main = async (): Promise<void> => {
  const binaryName: string = 'esbuild'
  const esbuildPath: string = join(root, 'node_modules', 'esbuild', 'bin', binaryName)
  const workerBundlePath = join(root, 'packages', 'typescript-worker', 'dist', 'typescriptWorkerMain.js')
  const developmentWorkerPath = join(root, 'typescriptWorkerMain.js')
  const typeScriptLibManifest = await getTypeScriptLibManifest(join(root, 'node_modules', 'typescript', 'lib'))
  const workerDistPath = join(root, 'packages', 'typescript-worker', 'dist')
  const updateDevelopmentWorker = async (): Promise<void> => {
    await copyFile(workerBundlePath, developmentWorkerPath)
    const content = await readFile(developmentWorkerPath, 'utf8')
    const sourcePath = '../../../node_modules/typescript/lib/'
    if (!content.includes(sourcePath)) {
      throw new Error('Failed to find TypeScript asset paths in bundled worker')
    }
    await writeFile(developmentWorkerPath, content.replaceAll(sourcePath, 'node_modules/typescript/lib/'))
  }
  await mkdir(workerDistPath, { recursive: true })
  watch(workerDistPath, (_eventType, fileName) => {
    if (fileName === 'typescriptWorkerMain.js') {
      void replaceTypeScriptLibManifest(workerBundlePath, typeScriptLibManifest).then(updateDevelopmentWorker)
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
