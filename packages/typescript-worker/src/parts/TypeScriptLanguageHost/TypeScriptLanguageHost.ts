import type { LanguageServiceHost, ParsedCommandLine } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'

export interface ILanguageServiceHost extends LanguageServiceHost {}

export const create = (
  ts: typeof import('typescript'),
  fileSystem: IFileSystem,
  syncRpc: SyncRpc,
  options: ParsedCommandLine,
): ILanguageServiceHost => {
  const languageServiceHost: ILanguageServiceHost = {
    getScriptKind(fileName) {
      return ts.ScriptKind.TS
    },
    // getParsedCommandLine(fileName) {
    //   return {}
    // },
    directoryExists(directoryName) {
      console.log({ trying2: directoryName })
      const result = syncRpc.invokeSync('SyncApi.exists', directoryName)
      console.log({ directoryName, result })
      return true
    },
    fileExists(path) {
      console.log({ trying3: path })
      const result = syncRpc.invokeSync('SyncApi.exists', path)
      console.log({ exists: path, result })

      return result
    },
    readFile(path) {
      console.log({ trying4: path })
      const content = syncRpc.invokeSync('SyncApi.readFileSync', path)
      if (!content) {
        return ''
      }
      return ''
    },
    getNewLine() {
      return '\n'
    },
    readDirectory(path, extensions, exclude, include, depth) {
      console.log({ trying1: path })
      const dirents = syncRpc.invokeSync('SyncApi.readDirSync', path)
      console.log({ path, dirents })
      return dirents
    },
    getDirectories(relativePath) {
      if (relativePath === '/node_modules/@types' || relativePath === 'node_modules/@types') {
        return []
      }
      const result = syncRpc.invokeSync('SyncApi.readDirSync', relativePath)
      console.log({ relativePath, result })
      if (result) {
        return []
      }
      return []
    },
    useCaseSensitiveFileNames() {
      return false
    },
    getProjectVersion() {
      return `${0}`
    },
    getScriptFileNames() {
      const files = fileSystem.getScriptFileNames() as string[]
      console.log({ files })
      return files
    },
    getScriptVersion(fileName) {
      return `${0}`
    },
    writeFile(fileName, content) {
      throw new Error('not implemented')
    },
    getCompilationSettings() {
      return options.options
    },
    getCustomTransformers() {
      throw new Error('not implemented')
    },
    getCurrentDirectory() {
      return ''
    },
    getDefaultLibFileName(options) {
      const defaultLibFileName = ts.getDefaultLibFileName(options)
      return defaultLibFileName
    },
    getScriptSnapshot(fileName) {
      if (isLibFile(fileName)) {
        const content = readLibFile(fileName)
        if (!content) {
          console.warn(`could not read lib file ${fileName}`)
          return undefined
        }
        return ts.ScriptSnapshot.fromString(content)
      }
      console.log({ trying6: fileName })
      const content = fileSystem.readFile(fileName) || syncRpc.invokeSync('SyncApi.readFileSync', fileName)
      console.log({ content, fileName })
      if (!content) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
  }
  return languageServiceHost
}
