import { rm } from 'node:fs/promises'
import { join } from 'node:path'

const NOT_NEEDED = [
  'bin',
  'loc',
  'AUTHORS.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE.txt',
  'SECURITY.md',
  'lib/cs',
  'lib/de',
  'lib/es',
  'lib/fr',
  'lib/it',
  'lib/ja',
  'lib/ko',
  'lib/pl',
  'lib/pt-br',
  'lib/ru',
  'lib/tr',
  'lib/zh-cn',
  'lib/zh-tw',
  'lib/README.md',
  'lib/_tsc.js',
  'lib/_tsserver.js',
  'lib/_typingsInstaller.js',
  'lib/protocol.d.ts',
  'lib/tsc.js',
  'lib/tsc.js',
  'lib/tsserver.js',
  'lib/tsserverlibrary.d.ts',
  'lib/tsserverlibrary.d.ts',
  'lib/tsserverlibrary.js',
  'lib/typescript.d.ts',
  'lib/typescript.js',
  'lib/typescriptServices.d.ts',
  'lib/typescriptServices.js',
  'lib/typingsInstaller.js',
  'lib/typingsInstaller.js',
]

export const removeUnusedTypeScriptFiles = async (cwd) => {
  for (const notNeeded of NOT_NEEDED) {
    await rm(join(cwd, notNeeded), { force: true, recursive: true })
  }
}
