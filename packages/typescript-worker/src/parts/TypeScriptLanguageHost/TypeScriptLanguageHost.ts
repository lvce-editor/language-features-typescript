import type { LanguageServiceHost, ParsedCommandLine } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { createModuleResolver } from '../CreateModuleResolver/CreateModuleResolver.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'

export interface ILanguageServiceHost extends LanguageServiceHost {}

export const create = (
  ts: typeof import('typescript'),
  fileSystem: IFileSystem,
  syncRpc: SyncRpc,
  options: ParsedCommandLine,
): ILanguageServiceHost => {
  const resolveModuleName = createModuleResolver(syncRpc)
  console.log('hi')
  const languageServiceHost: ILanguageServiceHost = {
    getScriptKind(fileName) {
      return ts.ScriptKind.TS
    },
    directoryExists(directoryName) {
      return true
    },
    fileExists(path) {
      if (path.includes('node_modules/@typescript/lib')) {
        return false
      }
      if (path.includes('node_modules/@types/typescript__lib')) {
        return false
      }
      const result = syncRpc.invokeSync('SyncApi.exists', path)
      console.log({ exits: result, path })
      return result
    },
    readFile(path) {
      console.log({ readFile: path })
      return ''
    },
    getNewLine() {
      return '\n'
    },
    readDirectory(path, extensions, exclude, include, depth) {
      const dirents = syncRpc.invokeSync('SyncApi.readDirSync', path)
      console.log({ readDir: path, dirents })
      return dirents
    },
    getDirectories(relativePath) {
      if (relativePath === '/node_modules/@types' || relativePath === 'node_modules/@types') {
        return []
      }
      const result = syncRpc.invokeSync('SyncApi.readDirSync', relativePath)
      console.log('get dir', { result, relativePath })
      if (result) {
        return []
      }
      return []
    },
    useCaseSensitiveFileNames() {
      return true
    },
    getProjectVersion() {
      return `${0}`
    },
    getScriptFileNames() {
      const files = fileSystem.getScriptFileNames() as string[]
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
        return ts.ScriptSnapshot.fromString(content)
      }
      console.log('snapshot', fileName)
      const content = fileSystem.readFile(fileName) || syncRpc.invokeSync('SyncApi.readFileSync', fileName)
      if (!content) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
    resolveModuleNameLiterals(
      moduleLiterals,
      containingFile,
      redirectedReference,
      options,
      containingSourceFile,
      reusedNames,
    ) {
      // if (Map) {
      //   const real = moduleLiterals.map((item) => {
      //     return ts.resolveModuleName(item.text, containingFile, options, languageServiceHost)
      //   })
      //   console.log({ real })
      //   return real
      // }
      return moduleLiterals.map((moduleLiteral) => {
        return resolveModuleName(moduleLiteral.text, containingFile, options)
      })
    },
    getProjectReferences() {
      return []
    },
  }
  return languageServiceHost
}
