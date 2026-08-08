import type * as TypeScript from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { createModuleResolver } from '../CreateModuleResolver/CreateModuleResolver.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'

export type ILanguageServiceHost = TypeScript.LanguageServiceHost

const doesSurelyNotExist = (path: string): boolean => {
  if (!path) {
    return true
  }
  if (path.includes('node_modules/@typescript/lib')) {
    return true
  }
  if (path.includes('node_modules/@types/typescript__lib')) {
    return true
  }
  return false
}

const getScriptKind = (ts: typeof TypeScript, fileName: string): TypeScript.ScriptKind => {
  const lowerCaseFileName = fileName.toLowerCase()
  if (lowerCaseFileName.endsWith('.tsx')) {
    return ts.ScriptKind.TSX
  }
  if (lowerCaseFileName.endsWith('.jsx')) {
    return ts.ScriptKind.JSX
  }
  if (lowerCaseFileName.endsWith('.js') || lowerCaseFileName.endsWith('.mjs') || lowerCaseFileName.endsWith('.cjs')) {
    return ts.ScriptKind.JS
  }
  if (lowerCaseFileName.endsWith('.json')) {
    return ts.ScriptKind.JSON
  }
  return ts.ScriptKind.TS
}

export const create = (
  ts: typeof TypeScript,
  fileSystem: IFileSystem,
  syncRpc: SyncRpc,
  options: TypeScript.ParsedCommandLine,
): ILanguageServiceHost => {
  const resolveModuleName = createModuleResolver(syncRpc, ts)
  const languageServiceHost: ILanguageServiceHost = {
    directoryExists(directoryName) {
      if (doesSurelyNotExist(directoryName)) {
        return false
      }
      const result = syncRpc.invokeSync('SyncApi.exists', directoryName)
      return result
    },
    fileExists(path) {
      if (doesSurelyNotExist(path)) {
        return false
      }
      const result = syncRpc.invokeSync('SyncApi.exists', path)
      return result
    },
    getCompilationSettings() {
      return options.options
    },
    getCurrentDirectory() {
      return options.options.rootDir || ''
    },
    getCustomTransformers() {
      throw new Error('not implemented')
    },
    getDefaultLibFileName(options) {
      const defaultLibFileName = ts.getDefaultLibFileName(options)
      return defaultLibFileName
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
    getNewLine() {
      return '\n'
    },
    getProjectReferences() {
      return []
    },
    getProjectVersion() {
      return fileSystem.getVersion()
    },
    getScriptFileNames() {
      const files = fileSystem.getScriptFileNames() as string[]
      return [...new Set([...options.fileNames, ...files])]
    },
    getScriptKind(fileName) {
      return getScriptKind(ts, fileName)
    },
    getScriptSnapshot(fileName) {
      if (isLibFile(fileName)) {
        const content = readLibFile(fileName)
        if (!content) {
          return undefined
        }
        return ts.ScriptSnapshot.fromString(content)
      }
      let content = fileSystem.readFile(fileName)
      if (content === undefined) {
        try {
          content = syncRpc.invokeSync('SyncApi.readFileSync', fileName)
        } catch {
          return undefined
        }
      }
      if (content === undefined) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
    getScriptVersion(fileName) {
      return fileSystem.getScriptVersion(fileName)
    },
    readDirectory(path, extensions, exclude, include, depth) {
      const dirents = syncRpc.invokeSync('SyncApi.readDirSync', path)
      return dirents
    },
    readFile(path) {
      try {
        return syncRpc.invokeSync('SyncApi.readFileSync', path)
      } catch {
        return undefined
      }
    },
    resolveModuleNameLiterals(
      moduleLiterals,
      containingFile,
      redirectedReference,
      options,
      containingSourceFile,
      reusedNames,
    ) {
      const resolved = moduleLiterals.map((moduleLiteral) => {
        return resolveModuleName(moduleLiteral.text, containingFile, options)
      })
      return resolved
    },
    useCaseSensitiveFileNames() {
      return true
    },
    writeFile(fileName, content) {
      throw new Error('not implemented')
    },
  }
  return languageServiceHost
}
