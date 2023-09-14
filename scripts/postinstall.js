import { readFileSync, writeFileSync } from 'node:fs'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const typeScriptPath = join(root, 'packages', 'extension', 'node_modules', 'typescript', 'lib', 'typescript.js')

const removeSourceMapUrl = () => {
  const content = readFileSync(typeScriptPath, 'utf8')
  const sourceMapString = `//# sourceMappingURL=typescript.js.map\n`
  const sourceMapIndex = content.lastIndexOf(sourceMapString)
  const newContent = sourceMapIndex === -1 ? content : content.slice(0, sourceMapIndex) + content.slice(sourceMapIndex + sourceMapString.length)
  writeFileSync(typeScriptPath, newContent)
}

const modifyTypeScript = () => {
  const content = readFileSync(typeScriptPath, 'utf8')
  const newContent = content.endsWith('export {ts}\n') ? content : content + 'export {ts}\n'
  const newContent2 = newContent.includes(`process.env.TS_ETW_MODULE_PATH) != null`)
    ? newContent.replace('process.env.TS_ETW_MODULE_PATH', `(typeof process === 'undefined' ? undefined : process.env.TS_ETW_MODULE_PATH)`)
    : newContent
  writeFileSync(typeScriptPath, newContent2)
}

const main = () => {
  removeSourceMapUrl()
  modifyTypeScript()
}

main()