import type { LanguageServiceHost, ParsedCommandLine, ResolvedModuleWithFailedLookupLocations } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'

export interface ILanguageServiceHost extends LanguageServiceHost {}

const isFullySpecified = (moduleText: string): boolean => {
  switch (moduleText) {
    case '':
    case '.':
    case './':
      return false
    default:
      return true
  }
}

export const create = (
  ts: typeof import('typescript'),
  fileSystem: IFileSystem,
  syncRpc: SyncRpc,
  options: ParsedCommandLine,
): ILanguageServiceHost => {
  const resolveModuleName = (
    text: string,
    containingFile: any,
    compilerOptions: any,
  ): ResolvedModuleWithFailedLookupLocations => {
    if (!isFullySpecified(text)) {
      return {
        resolvedModule: undefined,
      }
    }
    console.log({ text, containingFile })
    // ts.resolveModuleName(text, containingFile, compilerOptions, {})
    return {
      resolvedModule: {
        extension: '',
        resolvedFileName: '',
        // isExternalLibraryImport: false, // TODO
        // packageId: {
        //   name: '',
        //   subModuleName: '',
        //   version: '',
        // },
      },
    }
  }
  const languageServiceHost: ILanguageServiceHost = {
    getScriptKind(fileName) {
      return ts.ScriptKind.TS
    },
    // getParsedCommandLine(fileName) {
    //   return {}
    // },
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
      return result
    },
    readFile(path) {
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
