import { bundleJs, packageExtension, replace } from '@lvce-editor/package-extension'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path, { join } from 'path'
import { bundleExtensionJs } from './bundleExtensionJs.ts'
import { copyExtensionSchemas } from './copyExtensionSchemas.ts'
import { root } from './root.ts'

const extension: string = path.join(root, 'packages', 'extension')
const dist: string = join(root, '.tmp', 'dist')

const replaceTypeScriptWorkerAssetPaths = async (filePath: string, replacement: string): Promise<void> => {
  const content = await readFile(filePath, 'utf8')
  const oldTypeScriptPath = '../../../.tmp/dist/typescript/'
  if (!content.includes(oldTypeScriptPath)) {
    throw new Error('Failed to find TypeScript asset paths in bundled worker')
  }
  await writeFile(filePath, content.replaceAll(oldTypeScriptPath, replacement))
}

await rm(dist, { recursive: true, force: true })

await mkdir(dist, { recursive: true })

const packageJson: any = JSON.parse(await readFile(join(extension, 'package.json'), 'utf8'))
delete packageJson.jest
delete packageJson.devDependencies

await writeFile(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
await copyFile(join(root, 'README.md'), join(dist, 'README.md'))
await copyFile(join(extension, 'extension.json'), join(dist, 'extension.json'))
await mkdir(join(dist, 'media'), { recursive: true })
await copyFile(join(extension, 'media', 'icon.png'), join(dist, 'media', 'icon.png'))
await copyExtensionSchemas(extension, dist)

const wasmLib = join(root, 'node_modules', '@typescript', 'typescript-wasip1-wasm', 'lib')
await mkdir(join(dist, 'typescript'), { recursive: true })
await copyFile(join(wasmLib, 'tsc.wasm'), join(dist, 'typescript', 'tsc.wasm'))
await copyFile(
  join(root, 'node_modules', '@typescript', 'typescript-wasip1-wasm', 'LICENSE'),
  join(dist, 'typescript', 'LICENSE'),
)
const libNames: string[] = JSON.parse(await readFile(join(wasmLib, 'libFiles.json'), 'utf8'))
const libraries = Object.fromEntries(
  await Promise.all(libNames.map(async (name) => [name, await readFile(join(wasmLib, name), 'utf8')])),
)
// One request loads the standard libraries, rather than issuing a request per declaration file.
await writeFile(join(dist, 'typescript', 'libs.json'), JSON.stringify(libraries))

await replace({
  path: join(dist, 'extension.json'),
  occurrence: 'src/languageFeaturesTypeScriptMain.js',
  replacement: 'dist/languageFeaturesTypeScriptMain.js',
})

await replace({
  path: join(dist, 'extension.json'),
  occurrence: '../../typescriptWorkerMain.js',
  replacement: 'typescriptWorkerMain.js',
})

await bundleExtensionJs(
  join(root, 'packages', 'extension', 'src', 'languageFeaturesTypeScriptMain.ts'),
  join(root, 'packages', 'extension', 'dist', 'languageFeaturesTypeScriptMain.js'),
)

await bundleJs(
  join(root, 'packages', 'typescript-worker', 'src', 'typescriptWorkerMain.ts'),
  join(root, 'packages', 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
  false,
)

const workerBundlePath = join(root, 'packages', 'typescript-worker', 'dist', 'typescriptWorkerMain.js')

const developmentWorkerPath = join(root, 'typescriptWorkerMain.js')
await copyFile(workerBundlePath, developmentWorkerPath)
await replaceTypeScriptWorkerAssetPaths(developmentWorkerPath, '.tmp/dist/typescript/')

const packagedWorkerPath = join(dist, 'typescriptWorkerMain.js')
await copyFile(workerBundlePath, packagedWorkerPath)
await replaceTypeScriptWorkerAssetPaths(packagedWorkerPath, 'typescript/')

await mkdir(join(dist, 'dist'), {
  recursive: true,
})
await copyFile(
  join(root, 'packages', 'extension', 'dist', 'languageFeaturesTypeScriptMain.js'),
  join(dist, 'dist', 'languageFeaturesTypeScriptMain.js'),
)
await copyFile(join(root, 'LICENSE'), join(dist, 'LICENSE'))

if (!process.argv.includes('--skip-package')) {
  await packageExtension({
    highestCompression: true,
    inDir: join(dist),
    outFile: join(root, 'extension.tar.br'),
  })
}
