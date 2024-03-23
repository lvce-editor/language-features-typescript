import { exportStatic } from '@lvce-editor/shared-process'
import { readFileSync, writeFileSync } from 'node:fs'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path, { join } from 'node:path'
import { root } from './root.js'


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

await replace(getTypescriptPath, '../../../../extension/node_modules/typescript/lib/typescript-esm.js', '../../../../typescript/lib/typescript-esm.js')

const getLibFileUrl = path.join(
  root,
  'dist',
  commitHash,
  'extensions',
  'builtin.language-features-typescript',
  'web',
  'src',
  'parts',
  'GetLibFileUrl',
  'GetLibFileUrl.js'
)

await replace(getLibFileUrl, '../../../../extension/node_modules/typescript', '../../../../typescript')

const typeScriptLibPath = join(root, 'packages', 'extension', 'node_modules', 'typescript', 'lib')
const typeScriptPath = join(root, 'packages', 'extension', 'node_modules', 'typescript')

await mkdir(join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'typescript'))

const typescriptDirents = await readdir(typeScriptLibPath)
for (const typeScriptDirent of typescriptDirents) {
  if (typeScriptDirent.startsWith('lib.') || typeScriptDirent === 'typescript-esm.js' || typeScriptDirent === 'tsserverlibrary.js') {
    await cp(
      join(typeScriptLibPath, typeScriptDirent),
      join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'typescript', 'lib', typeScriptDirent)
    )
  }
}

for (const dirent of ['README.md', 'LICENSE.txt', 'package.json']) {
  await cp(join(typeScriptPath, dirent), join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript', 'typescript', dirent))
}

const updateJson = (path, update) => {
  const oldJson = JSON.parse(readFileSync(path, 'utf8'))
  const newJson = update(oldJson)
  writeFileSync(path, JSON.stringify(newJson, null, 2) + '\n')
}

const updateSettings = (oldSettings) => {
  return {
    ...oldSettings,
    'editor.diagnostics': true,
  }
}
const defaultSettingsPath = join(root, 'dist', commitHash, 'config', 'defaultSettings.json')
updateJson(defaultSettingsPath, updateSettings)

const fileMapPath = join(root, 'dist', commitHash, 'config', 'fileMap.json')
const updateFileMap = (oldFileMap) => {
  return [...oldFileMap, '/playground/languages/error.ts']
}
updateJson(fileMapPath, updateFileMap)

const errorPath = join(root, 'dist', commitHash, 'playground', 'languages', 'error.ts')
writeFileSync(
  errorPath,
  `const add = (a,b) => {
  return a + b
}

add(1,2,3,4)`
)
