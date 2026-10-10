import type * as TypeScript from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { createModuleResolver } from '../CreateModuleResolver/CreateModuleResolver.ts'
import { createReadDirectory } from '../CreateReadDirectory/CreateReadDirectory.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'

export type ILanguageServiceHost = TypeScript.LanguageServiceHost &
  Pick<TypeScript.CompilerHost, 'hasInvalidatedResolutions'>

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
  roots: ReadonlySet<string> = new Set(options.fileNames),
  references: ReadonlySet<string> = roots,
): ILanguageServiceHost => {
  const resolveModuleName = createModuleResolver(syncRpc, ts)
  const versions = new Map<string, string>()
  let projectVersion = 0
  let rootNames = ''
  // Disk identity changes retire affected services. Override removal must only
  // change the version of that document, not every disk-backed dependency.
  const scriptVersion = (uri: string): string =>
    fileSystem.readFile(uri) === undefined ? 'disk' : fileSystem.getScriptVersion(uri)
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
      versions.set(path, scriptVersion(path))
      const result = syncRpc.invokeSync('SyncApi.exists', path)
      return result
    },
    getCompilationSettings() {
      return options.options
    },
    getCurrentDirectory() {
      const configPath = options.options.configFilePath
      return typeof configPath === 'string' ? getParentPath(configPath) : options.options.rootDir || ''
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
      return options.projectReferences || []
    },
    getProjectVersion() {
      const names = JSON.stringify([...roots])
      if (names !== rootNames) {
        rootNames = names
        projectVersion++
      }
      const observedFiles = new Set([...roots, ...references, ...versions.keys()])
      for (const uri of observedFiles) {
        const current = scriptVersion(uri)
        if (versions.has(uri) && versions.get(uri) !== current) projectVersion++
        versions.set(uri, current)
      }
      return projectVersion.toString()
    },
    getScriptFileNames() {
      return [...roots]
    },
    getScriptKind(fileName) {
      return getScriptKind(ts, fileName)
    },
    getScriptSnapshot(fileName) {
      versions.set(fileName, scriptVersion(fileName))
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
      return scriptVersion(fileName)
    },
    // A project version change can make a failed lookup succeed even when the
    // importing source text is unchanged. Recheck resolution on that rebuild.
    hasInvalidatedResolutions() {
      return true
    },
    readDirectory: createReadDirectory(
      ts,
      (path) => syncRpc.invokeSync('SyncApi.readDirSync', path),
      typeof options.options.configFilePath === 'string' ? getParentPath(options.options.configFilePath) : '',
    ),
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
      for (const uri of references) {
        if (!versions.has(uri)) versions.set(uri, scriptVersion(uri))
      }
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
