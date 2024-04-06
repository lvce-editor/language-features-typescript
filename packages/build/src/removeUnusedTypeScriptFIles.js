import { rm } from 'node:fs/promises'
import { join } from 'node:path'

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

export const removeUnusedTypeScriptFiles = async (cwd) => {
  for (const notNeeded of NOT_NEEDED) {
    await rm(join(cwd, notNeeded), { force: true, recursive: true })
  }
}
