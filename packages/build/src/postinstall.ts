import { readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { root } from './root.ts'

const typeScriptPath: string = join(root, 'node_modules', 'typescript', 'lib', 'typescript.js')

const typeScriptPathEsm: string = join(root, 'node_modules', 'typescript', 'lib', 'typescript-esm.js')

const removeSourceMapUrl = (typeScriptPath: string): void => {
  const baseName: string = basename(typeScriptPath)
  const content: string = readFileSync(typeScriptPath, 'utf8')
  const sourceMapString: string = `//# sourceMappingURL=${baseName}.map\n`
  const sourceMapIndex: number = content.lastIndexOf(sourceMapString)
  const newContent: string =
    sourceMapIndex === -1
      ? content
      : content.slice(0, sourceMapIndex) + content.slice(sourceMapIndex + sourceMapString.length)
  writeFileSync(typeScriptPath, newContent)
}

const modifyTypeScript = (typeScriptPath: string, typeScriptPathEsm: string): void => {
  const content: string = readFileSync(typeScriptPath, 'utf8')
  const newContent: string = content.endsWith('export {ts}\n') ? content : content + 'export {ts}\n'
  const newContent2: string = newContent.includes(`process.env.TS_ETW_MODULE_PATH) != null`)
    ? newContent.replace(
        'process.env.TS_ETW_MODULE_PATH',
        `(typeof process === 'undefined' ? undefined : process.env.TS_ETW_MODULE_PATH)`,
      )
    : newContent
  const newContent3: string = newContent2.replace(
    `const etwModulePath = process.env.TS_ETW_MODULE_PATH ?? "./node_modules/@microsoft/typescript-etw";`,
    `const etwModulePath = typeof process === 'undefined' ? undefined : process.env.TS_ETW_MODULE_PATH ?? "./node_modules/@microsoft/typescript-etw";`,
  )
  const newContent4: string = newContent3.replace(
    `etwModule =   require(etwModulePath);`,
    `etwModulePath = typeof require === 'undefined' ? undefined : require(etwModulePath)`,
  )
  writeFileSync(typeScriptPathEsm, newContent4)
}

const main = (): void => {
  modifyTypeScript(typeScriptPath, typeScriptPathEsm)
  removeSourceMapUrl(typeScriptPath)
}

main()
