import { exportStatic } from '@lvce-editor/shared-process'
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

await exportStatic({
  extensionPath: 'packages/extension',
  testPath: 'packages/e2e',
  root,
})

const RE_COMMIT_HASH = /^[a-z\d]+$/
const isCommitHash = (dirent) => {
  return dirent.length === 7 && dirent.match(RE_COMMIT_HASH)
}

const dirents = await readdir(path.join(root, 'dist'))
const commitHash = dirents.find(isCommitHash) || ''

for (const dirent of ['src']) {
  await cp(
    path.join(root, 'packages', 'web', dirent),
    path.join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'web', dirent),
    { recursive: true, force: true }
  )
}

const replace = async (path, occurrence, replacement) => {
  const oldContent = await readFile(path, 'utf8')
  if (!oldContent.includes(occurrence)) {
    throw new Error(`occurrence not found ${occurrence}`)
  }
  // @ts-ignore
  const newContent = oldContent.replaceAll(occurrence, replacement)
  await writeFile(path, newContent)
}

const isWebPath = path.join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'src', 'parts', 'IsWeb', 'IsWeb.js')

await replace(isWebPath, 'false', 'true')

const tsClientPathWeb = path.join(
  root,
  'dist',
  commitHash,
  'extensions',
  'builtin.language-features-typescript',
  'src',
  'parts',
  'GetTsClientPathWeb',
  'GetTsClientPathWeb.js'
)

await replace(tsClientPathWeb, '../../../../web/src/webMain.js', '../../../web/src/webMain.js')

const getTypescriptPath = path.join(
  root,
  'dist',
  commitHash,
  'extensions',
  'builtin.language-features-typescript',
  'web',
  'src',
  'parts',
  'GetTypeScriptPath',
  'GetTypeScriptPath.js'
)

await replace(getTypescriptPath, '../../../../extension/node_modules/typescript/lib/typescript.js', '../../../../typescript/lib/typescript.js')

const getTsServerLibraryPath = path.join(
  root,
  'dist',
  commitHash,
  'extensions',
  'builtin.language-features-typescript',
  'web',
  'src',
  'parts',
  'GetTsServerLibraryPath',
  'GetTsServerLibraryPath.js'
)

await replace(
  getTsServerLibraryPath,
  '../../../../extension/node_modules/typescript/lib/tsserverlibrary.js',
  '../../../../typescript/lib/tsserverlibrary.js'
)

const readLibFile = path.join(
  root,
  'dist',
  commitHash,
  'extensions',
  'builtin.language-features-typescript',
  'web',
  'src',
  'parts',
  'ReadLibFile',
  'ReadLibFile.js'
)

await replace(readLibFile, '../../../../extension/node_modules/typescript', '../../../typescript')

const typeScriptLibPath = join(root, 'packages', 'extension', 'node_modules', 'typescript', 'lib')
const typeScriptPath = join(root, 'packages', 'extension', 'node_modules', 'typescript')

await mkdir(join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'typescript'))

const typescriptDirents = await readdir(typeScriptLibPath)
for (const typeScriptDirent of typescriptDirents) {
  if (typeScriptDirent.startsWith('lib.') || typeScriptDirent === 'typescript.js' || typeScriptDirent === 'tsserverlibrary.js') {
    await cp(
      join(typeScriptLibPath, typeScriptDirent),
      join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'typescript', 'lib', typeScriptDirent)
    )
  }
}

for (const dirent of ['README.md', 'LICENSE.txt', 'package.json']) {
  await cp(join(typeScriptPath, dirent), join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'typescript', dirent))
}
