import { execSync } from 'child_process'
import fs, { readFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { packageExtension } from '@lvce-editor/package-extension'

const NOT_NEEDED = [
  'node_modules/typescript/bin',
  'node_modules/typescript/loc',
  'node_modules/typescript/AUTHORS.md',
  'node_modules/typescript/CODE_OF_CONDUCT.md',
  'node_modules/typescript/CopyrightNotice.txt',
  'node_modules/typescript/LICENSE.txt',
  'node_modules/typescript/README.md',
  'node_modules/typescript/SECURITY.md',
  'node_modules/typescript/ThirdPartyNoticeText.txt',
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
  'node_modules/typescript/lib/tsserverlibrary.js',
  'node_modules/typescript/lib/tsserverlibrary.d.ts',
  'node_modules/typescript/lib/typescript.js',
  'node_modules/typescript/lib/typescript.d.ts',
  'node_modules/typescript/lib/typescriptServices.js',
  'node_modules/typescript/lib/typescriptServices.d.ts',
  'node_modules/typescript/lib/protocol.d.ts',
  'node_modules/typescript/lib/typingsInstaller.js',
]

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

fs.mkdirSync(path.join(root, 'dist'))

const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json')).toString()
)
delete packageJson.xo
delete packageJson.jest
delete packageJson.prettier
delete packageJson.devDependencies

fs.writeFileSync(
  join(root, 'dist', 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
)
fs.copyFileSync(join(root, 'README.md'), join(root, 'dist', 'README.md'))
fs.copyFileSync(join(root, 'icon.png'), join(root, 'dist', 'icon.png'))
fs.copyFileSync(
  join(root, 'extension.json'),
  join(root, 'dist', 'extension.json')
)
fs.cpSync(join(root, 'src'), join(root, 'dist', 'src'), { recursive: true })

const getAllDependencies = (obj) => {
  if (!obj || !obj.dependencies) {
    return []
  }
  return [obj, ...Object.values(obj.dependencies).flatMap(getAllDependencies)]
}

const getDependencies = () => {
  const stdout = execSync('npm list --omit=dev --parseable --all', {
    cwd: root,
  }).toString()
  const lines = stdout.split('\n')
  return lines.slice(1, -1)
}

const dependencies = getDependencies()
for (const dependency of dependencies) {
  fs.cpSync(dependency, join(root, 'dist', dependency.slice(root.length)), {
    recursive: true,
  })
}

for (const notNeeded of NOT_NEEDED) {
  fs.rmSync(join(root, 'dist', notNeeded), { force: true, recursive: true })
}

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
