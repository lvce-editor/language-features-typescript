import { bundleJs, packageExtension, replace } from '@lvce-editor/package-extension'
import { execSync } from 'child_process'
import { copyFile, cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises'
import path, { join } from 'path'
import { root } from './root.js'
import { removeUnusedTypeScriptFiles } from './removeUnusedTypeScriptFIles.js'

const extension = path.join(root, 'packages', 'extension')
const node = path.join(root, 'packages', 'node')
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

const getAllDependencies = (obj) => {
  if (!obj || !obj.dependencies) {
    return []
  }
  return [obj, ...Object.values(obj.dependencies).flatMap(getAllDependencies)]
}

const getDependencies = (cwd) => {
  const stdout = execSync('npm list --omit=dev --parseable --all', {
    cwd,
  }).toString()
  const lines = stdout.split('\n')
  return lines.slice(1, -1)
}

const copyDependencies = async (from, to) => {
  const dependencies = getDependencies(from)
  for (const dependency of dependencies) {
    await cp(dependency, join(dist, to, dependency.slice(from.length)), {
      recursive: true,
    })
  }
}

await copyDependencies(extension, '')

await copyDependencies(node, 'node')

await cp(join(root, 'node_modules', 'typescript'), join(dist, 'node', 'node_modules', 'typescript'), {
  recursive: true,
})
await removeUnusedTypeScriptFiles(join(dist, 'node'))

await cp(join(root, 'packages', 'node', 'src'), join(dist, 'node', 'src'), {
  recursive: true,
})
await cp(join(root, 'packages', 'node', 'package.json'), join(dist, 'node', 'package.json'))

await cp(join(root, 'packages', 'web', 'src'), join(dist, 'web', 'src'), {
  recursive: true,
})

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

await replace({
  path: join(root, 'dist', 'src', 'parts', 'GetTsClientPathNode', 'GetTsClientPathNode.js'),
  occurrence: '../node/',
  replacement: 'node/',
})

await bundleJs(
  join(root, 'dist', 'src', 'languageFeaturesTypeScriptMain.js'),
  join(root, 'dist', 'dist', 'languageFeaturesTypeScriptMain.js'),
)

await bundleJs(
  join(root, 'dist', 'typescript-worker', 'src', 'typescriptWorkerMain.ts'),
  join(root, 'dist', 'typescript-worker', 'dist', 'typescriptWorkerMain.js'),
)

await packageExtension({
  highestCompression: true,
  inDir: join(dist),
  outFile: join(root, 'extension.tar.br'),
})
