import { bundleJs, packageExtension, replace } from '@lvce-editor/package-extension'
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path, { join } from 'path'
import { removeUnusedTypeScriptFiles } from './removeUnusedTypeScriptFIles.js'
import { root } from './root.js'

const extension = path.join(root, 'packages', 'extension')
const dist = join(root, 'dist')

await rm(dist, { recursive: true, force: true })

await mkdir(dist)

const packageJson = JSON.parse(await readFile(join(extension, 'package.json'), 'utf8'))
delete packageJson.jest
delete packageJson.devDependencies

await writeFile(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
await copyFile(join(root, 'README.md'), join(dist, 'README.md'))
await copyFile(join(extension, 'icon.png'), join(dist, 'icon.png'))
await copyFile(join(extension, 'extension.json'), join(dist, 'extension.json'))
await cp(join(extension, 'src'), join(dist, 'src'), {
  recursive: true,
})

await cp(join(root, 'node_modules', 'typescript'), join(dist, 'typescript'), {
  recursive: true,
})
await removeUnusedTypeScriptFiles(join(dist, 'node'))

await cp(join(root, 'packages', 'typescript-worker', 'src'), join(dist, 'typescript-worker', 'src'), {
  recursive: true,
})

const assetDirPath = path.join(root, 'dist', 'src', 'parts', 'AssetDir', 'AssetDir.js')

await replace({
  path: assetDirPath,
  occurrence: '../../../../',
  replacement: '../',
})

await replace({
  path: join(root, 'dist', 'extension.json'),
  occurrence: 'src/languageFeaturesTypeScriptMain.js',
  replacement: 'dist/languageFeaturesTypeScriptMain.js',
})

await bundleJs(
  join(root, 'dist', 'src', 'languageFeaturesTypeScriptMain.js'),
  join(root, 'dist', 'dist', 'languageFeaturesTypeScriptMain.js'),
)

await bundleJs(
  join(root, 'packages', 'extension', 'src', 'languageFeaturesTypeScriptMain.js'),
  join(root, 'packages', 'extension', 'dist', 'languageFeaturesTypeScriptMain.js'),
)

await bundleJs(
  join(root, 'dist', 'typescript-worker', 'src', 'typescriptWorkerMain.ts'),
  join(root, 'dist', 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
  false,
)

await bundleJs(
  join(root, 'packages', 'typescript-worker', 'src', 'typescriptWorkerMain.ts'),
  join(root, 'packages', 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
  false,
)

await rm(join(root, 'dist', 'typescript-worker', 'src'), { recursive: true, force: true })
await rm(join(root, 'dist', 'src'), { recursive: true, force: true })
await rm(join(root, 'dist', 'typescript', 'bin'), { recursive: true, force: true })
await rm(join(root, 'dist', 'typescript', 'README.md'), { force: true })
await rm(join(root, 'dist', 'typescript', 'SECURITY.md'), { force: true })

await replace({
  path: join(root, 'dist', 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
  ocurrence: '../../../node_modules/typescript/lib/typescript-esm.js',
  replacement: '../../typescript/lib/typescript-esm.js',
})

await packageExtension({
  highestCompression: true,
  inDir: join(dist),
  outFile: join(root, 'extension.tar.br'),
})
