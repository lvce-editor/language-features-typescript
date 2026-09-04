import { bundleJs, packageExtension, replace } from '@lvce-editor/package-extension'
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path, { join } from 'path'
import { bundleExtensionJs } from './bundleExtensionJs.ts'
import { copyExtensionSchemas } from './copyExtensionSchemas.ts'
import { removeUnusedTypeScriptFiles } from './removeUnusedTypeScriptFIles.ts'
import { root } from './root.ts'

const extension: string = path.join(root, 'packages', 'extension')
const dist: string = join(root, '.tmp', 'dist')

const replaceTypeScriptWorkerAssetDir = async (filePath: string): Promise<void> => {
  const content = await readFile(filePath, 'utf8')
  const occurrences = [`new URL('../../', import.meta.url)`, `new URL("../../", import.meta.url)`]
  const occurrence = occurrences.find((value) => content.includes(value))
  if (!occurrence) {
    throw new Error('Failed to find TypeScript worker asset directory in bundled extension')
  }
  const replacement = occurrence.replace('../../', '../')
  await writeFile(filePath, content.replace(occurrence, replacement))
}

const replaceTypeScriptWorkerAssetPaths = async (filePath: string): Promise<void> => {
  const content = await readFile(filePath, 'utf8')
  const oldTypeScriptPath = '../../../node_modules/typescript/lib/'
  if (!content.includes(oldTypeScriptPath)) {
    throw new Error('Failed to find TypeScript asset paths in bundled worker')
  }
  await writeFile(filePath, content.replaceAll(oldTypeScriptPath, '../../typescript/lib/'))
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

await cp(join(root, 'node_modules', 'typescript'), join(dist, 'typescript'), {
  recursive: true,
})

await replace({
  path: join(dist, 'extension.json'),
  occurrence: 'src/languageFeaturesTypeScriptMain.js',
  replacement: 'dist/languageFeaturesTypeScriptMain.js',
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

await mkdir(join(dist, 'typescript-worker', 'dist'), {
  recursive: true,
})
await copyFile(
  join(root, 'packages', 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
  join(dist, 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
)

await mkdir(join(dist, 'dist'), {
  recursive: true,
})
await copyFile(
  join(root, 'packages', 'extension', 'dist', 'languageFeaturesTypeScriptMain.js'),
  join(dist, 'dist', 'languageFeaturesTypeScriptMain.js'),
)
await copyFile(join(root, 'LICENSE'), join(dist, 'LICENSE'))

await replaceTypeScriptWorkerAssetDir(join(dist, 'dist', 'languageFeaturesTypeScriptMain.js'))

await removeUnusedTypeScriptFiles(join(dist, 'typescript'))

await replaceTypeScriptWorkerAssetPaths(join(dist, 'typescript-worker', 'dist', 'typescriptWorkerMain.js'))

await packageExtension({
  highestCompression: true,
  inDir: join(dist),
  outFile: join(root, 'extension.tar.br'),
})
