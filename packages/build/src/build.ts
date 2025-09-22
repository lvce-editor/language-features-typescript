import { bundleJs, packageExtension, replace } from '@lvce-editor/package-extension'
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path, { join } from 'path'
import { removeUnusedTypeScriptFiles } from './removeUnusedTypeScriptFIles.ts'
import { root } from './root.ts'

const extension: string = path.join(root, 'packages', 'extension')
const dist: string = join(root, '.tmp', 'dist')

await rm(dist, { recursive: true, force: true })

await mkdir(dist, { recursive: true })

const packageJson: any = JSON.parse(await readFile(join(extension, 'package.json'), 'utf8'))
delete packageJson.jest
delete packageJson.devDependencies

await writeFile(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
await copyFile(join(root, 'README.md'), join(dist, 'README.md'))
await copyFile(join(extension, 'icon.png'), join(dist, 'icon.png'))
await copyFile(join(extension, 'extension.json'), join(dist, 'extension.json'))

await cp(join(root, 'node_modules', 'typescript'), join(dist, 'typescript'), {
  recursive: true,
})

await replace({
  path: join(dist, 'extension.json'),
  occurrence: 'src/languageFeaturesTypeScriptMain.js',
  replacement: 'dist/languageFeaturesTypeScriptMain.js',
})

await bundleJs(
  join(root, 'packages', 'extension', 'src', 'languageFeaturesTypeScriptMain.ts'),
  join(root, 'packages', 'extension', 'dist', 'languageFeaturesTypeScriptMain.js'),
  false,
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

await replace({
  path: join(dist, 'dist', 'languageFeaturesTypeScriptMain.js'),
  occurrence: `'../../'`,
  replacement: `'../'`,
})

await removeUnusedTypeScriptFiles(join(dist, 'typescript'))

await replace({
  path: join(dist, 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
  occurrence: '../../../node_modules/typescript/lib/typescript-esm.js',
  replacement: '../../typescript/lib/typescript-esm.js',
})

await packageExtension({
  highestCompression: true,
  inDir: join(dist),
  outFile: join(root, 'extension.tar.br'),
})
