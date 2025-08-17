import { execa } from 'execa'
import { root } from './root.js'
import { join } from 'node:path'

const main = async () => {
  const binaryName = process.platform === 'win32' ? 'esbuild.exe' : 'esbuild'
  const esbuildPath = join(root, 'packages', 'build', 'node_modules', 'esbuild', 'bin', binaryName)
  execa(
    esbuildPath,
    [
      '--format=esm',
      '--bundle',
      '--watch',
      'packages/extension/src/languageFeaturesTypeScriptMain.js',
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
  execa(
    'node',
    [
      'packages/server/node_modules/@lvce-editor/server/bin/server.js',
      '--test-path=packages/e2e',
      '--only-extension=packages/extension',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
}

main()
