import type { LanguageServiceHost, ParsedCommandLine, ResolvedModuleWithFailedLookupLocations } from 'typescript'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

export interface ILanguageServiceHost extends LanguageServiceHost {}

export const create = (
  ts: typeof import('typescript'),
  syncRpc: SyncRpc,
  options: ParsedCommandLine,
): ILanguageServiceHost => {
  const languageServiceHost: ILanguageServiceHost = {
    getScriptKind(fileName) {
      return ts.ScriptKind.TS
    },
    resolveTypeReferenceDirectiveReferences(
      typeDirectiveReferences,
      containingFile,
      redirectedReference,
      options,
      containingSourceFile,
      reusedNames,
    ) {
      return []
    },
    resolveModuleNameLiterals(
      moduleLiterals,
      containingFile,
      redirectedReference,
      options,
      containingSourceFile,
      reusedNames,
    ) {
      const resolvedModules: readonly ResolvedModuleWithFailedLookupLocations[] = moduleLiterals.map((literal) => {
        const text = literal.getText(containingSourceFile)
        const module = ts.resolveModuleName(text, containingFile, options, {
          fileExists: (uri) => {
            return syncRpc.invokeSync('SyncApi.exists', uri)
          },
          readFile: (uri) => {
            return syncRpc.invokeSync('SyncApi.readFileSync', uri)
          },
          directoryExists: (uri) => {
            return syncRpc.invokeSync('SyncApi.exists', uri)
          },
          getCurrentDirectory: () => '',
          getDirectories: (uri) => {
            const dirents = syncRpc.invokeSync('SyncApi.readDirSync', uri)
            return dirents
          },
        }).resolvedModule

        return {
          resolvedModule: module,
        }
      })
      console.log({ resolvedModules })
      return resolvedModules
    },
    // getParsedCommandLine(fileName) {
    //   return options
    // },
    directoryExists(directoryName) {
      return true
    },
    fileExists(path) {
      return true
    },
    readFile(path) {
      return ''
    },
    getNewLine() {
      return '\n'
    },
    readDirectory(path, extensions, exclude, include, depth) {
      console.log('read dir', path)

      const dirents = syncRpc.invokeSync('SyncApi.readDirSync', path)
      return dirents
    },
    getDirectories(relativePath) {
      if (relativePath === '/node_modules/@types' || relativePath === 'node_modules/@types') {
        return []
      }
      const result = syncRpc.invokeSync('SyncApi.readDirSync', relativePath)
      console.log('read dir', relativePath)
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
      return options.fileNames
    },
    getScriptVersion(fileName) {
      return `0`
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
      const currentDirectory = options.options.rootDir || ''
      console.log({ currentDirectory })
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
      const content = syncRpc.invokeSync('SyncApi.readFileSync', fileName)
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
