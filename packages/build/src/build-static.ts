import { exportStatic } from '@lvce-editor/shared-process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './root.ts'
import { cp } from 'node:fs/promises'

const { commitHash } = await exportStatic({
  extensionPath: 'packages/extension',
  testPath: 'packages/e2e',
  root,
})

const updateJson = (path: string, update: (oldJson: any) => any): void => {
  const oldJson = JSON.parse(readFileSync(path, 'utf8'))
  const newJson = update(oldJson)
  writeFileSync(path, JSON.stringify(newJson, null, 2) + '\n')
}

const updateSettings = (oldSettings: any): any => {
  return {
    ...oldSettings,
    'editor.diagnostics': true,
  }
}
const defaultSettingsPath: string = join(root, 'dist', commitHash, 'config', 'defaultSettings.json')
updateJson(defaultSettingsPath, updateSettings)

const fileMapPath: string = join(root, 'dist', commitHash, 'config', 'fileMap.json')
const updateFileMap = (oldFileMap: any[]): any[] => {
  return [...oldFileMap, '/playground/languages/error.ts']
}
updateJson(fileMapPath, updateFileMap)

const errorPath: string = join(root, 'dist', commitHash, 'playground', 'languages', 'error.ts')
writeFileSync(
  errorPath,
  `const add = (a,b) => {
  return a + b
}

add(1,2,3,4)`,
)

await cp(
  join(root, '.tmp', 'dist'),
  join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-typescript'),
  {
    recursive: true,
    force: true,
  },
)

