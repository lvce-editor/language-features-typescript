import { packageExtension } from '@lvce-editor/package-extension'
import { execSync } from 'child_process'
import fs, { cpSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const NOT_NEEDED = [
  'node_modules/minimist/.github',
  'node_modules/minimist/example',
  'node_modules/minimist/test',
  'node_modules/minimist/.eslintrc',
  'node_modules/minimist/.nycrc',
  'node_modules/minimist/CHANGELOG.md',
  'node_modules/typescript/bin',
  'node_modules/typescript/loc',
  'node_modules/typescript/AUTHORS.md',
  'node_modules/typescript/CODE_OF_CONDUCT.md',
  'node_modules/typescript/LICENSE.txt',
  'node_modules/typescript/SECURITY.md',
  'node_modules/typescript/lib/cs',
  'node_modules/typescript/lib/de',
  'node_modules/typescript/lib/es',
  'node_modules/typescript/lib/fr',
  'node_modules/typescript/lib/it',
  'node_modules/typescript/lib/ja',
  'node_modules/typescript/lib/ko',
  'node_modules/typescript/lib/pl',
  'node_modules/typescript/lib/pt-br',
  'node_modules/typescript/lib/ru',
  'node_modules/typescript/lib/tr',
  'node_modules/typescript/lib/zh-cn',
  'node_modules/typescript/lib/zh-tw',
  'node_modules/typescript/lib/README.md',
  'node_modules/typescript/lib/tsc.js',
  'node_modules/typescript/lib/tsserverlibrary.d.ts',
  'node_modules/typescript/lib/typescript.d.ts',
  'node_modules/typescript/lib/typescriptServices.js',
  'node_modules/typescript/lib/typescriptServices.d.ts',
  'node_modules/typescript/lib/protocol.d.ts',
  'node_modules/typescript/lib/typingsInstaller.js',
]

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const extension = path.join(root, 'packages', 'extension')
const node = path.join(root, 'packages', 'node')
const dist = join(root, 'dist')

fs.rmSync(dist, { recursive: true, force: true })

fs.mkdirSync(dist)

const packageJson = JSON.parse(readFileSync(join(extension, 'package.json')).toString())
delete packageJson.jest
delete packageJson.devDependencies

fs.writeFileSync(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
fs.copyFileSync(join(root, 'README.md'), join(dist, 'README.md'))
fs.copyFileSync(join(extension, 'icon.png'), join(dist, 'icon.png'))
fs.copyFileSync(join(extension, 'extension.json'), join(dist, 'extension.json'))
fs.cpSync(join(extension, 'src'), join(dist, 'src'), {
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

const copyDependencies = (from, to) => {
  const dependencies = getDependencies(from)
  for (const dependency of dependencies) {
    fs.cpSync(dependency, join(dist, to, dependency.slice(from.length)), {
      recursive: true,
    })
  }
}

copyDependencies(extension, '')

copyDependencies(node, 'node')

for (const notNeeded of NOT_NEEDED) {
  fs.rmSync(join(dist, 'node', notNeeded), { force: true, recursive: true })
}

cpSync(join(root, 'packages', 'node', 'src'), join(dist, 'node', 'src'), {
  recursive: true,
})
cpSync(join(root, 'packages', 'node', 'package.json'), join(dist, 'node', 'package.json'))

const replace = ({ path, occurrence, replacement }) => {
  const oldContent = readFileSync(path, 'utf-8')
  const newContent = oldContent.replace(occurrence, replacement)
  writeFileSync(path, newContent)
}

replace({
  path: join(root, 'dist', 'src', 'parts', 'GetTsClientPathNode', 'GetTsClientPathNode.js'),
  occurrence: '../node/',
  replacement: 'node/',
})

await packageExtension({
  highestCompression: true,
  inDir: join(dist),
  outFile: join(root, 'extension.tar.br'),
})
