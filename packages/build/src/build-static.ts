import { readFileSync, writeFileSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

import { pathToFileURL } from 'node:url'
import { updateStaticExtension } from './updateStaticExtension.ts'

const sharedProcessPath = join(root, 'node_modules', '@lvce-editor', 'shared-process', 'index.js')

const sharedProcessUrl = pathToFileURL(sharedProcessPath).toString()

const sharedProcess = await import(sharedProcessUrl)

process.env.PATH_PREFIX = '/language-features-typescript'

const { commitHash } = await sharedProcess.exportStatic({
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

const updateStaticExtensions = (configPath: string, extensionJsonPath: string): void => {
  const extensions = JSON.parse(readFileSync(configPath, 'utf8'))
  const extensionJson = JSON.parse(readFileSync(extensionJsonPath, 'utf8'))
  const updatedExtensions = updateStaticExtension(extensions, extensionJson)
  writeFileSync(configPath, JSON.stringify(updatedExtensions, null, 2) + '\n')
}

const extensionJsonPath = join(root, '.tmp', 'dist', 'extension.json')
updateStaticExtensions(join(root, 'dist', commitHash, 'config', 'extensions.json'), extensionJsonPath)
updateStaticExtensions(join(root, 'dist', commitHash, 'config', 'webExtensions.json'), extensionJsonPath)

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
