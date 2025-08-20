import type { LanguageServiceHost, ParsedCommandLine } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

export interface ILanguageServiceHost extends LanguageServiceHost {}

export const create = (
  ts: typeof import('typescript'),
  fileSystem: IFileSystem,
  syncRpc: SyncRpc,
  options: ParsedCommandLine,
): ILanguageServiceHost => {
  console.log({ options })
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
      console.log('type refrence')
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
      return moduleLiterals.map((literal) => {
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
    },
    // getParsedCommandLine(fileName) {
    //   return options
    // },
    directoryExists(directoryName) {
      console.log('dir ex', directoryName)
      return true
    },
    fileExists(path) {
      console.log('exists', path)
      return true
    },
    readFile(path) {
      console.log('read', path)
      return ''
    },
    getNewLine() {
      return '\n'
    },
    readDirectory(path, extensions, exclude, include, depth) {
      const dirents = syncRpc.invokeSync('SyncApi.readDirSync', path)
      return dirents
    },
    getDirectories(relativePath) {
      if (relativePath === '/node_modules/@types' || relativePath === 'node_modules/@types') {
        return []
      }
      const result = syncRpc.invokeSync('SyncApi.readDirSync', relativePath)
      if (result) {
        return []
      }
      return []
    },
    useCaseSensitiveFileNames() {
      return false
    },
    getProjectVersion() {
      return `${fileSystem.getVersion()}`
    },
    getScriptFileNames() {
      console.log('get filenames', options.fileNames)
      return options.fileNames
    },
    getScriptVersion(fileName) {
      return fileSystem.getScriptVersion(fileName)
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
      if (fileName === 'lib.d.ts' || fileName.startsWith('node_modules/@typescript/lib')) {
        const content = readLibFile(fileName)
        return ts.ScriptSnapshot.fromString(content)
      }
      const content = fileSystem.readFile(fileName)
      if (!content) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
  }
  return languageServiceHost
}
