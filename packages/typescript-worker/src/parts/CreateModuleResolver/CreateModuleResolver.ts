import type * as TypeScript from 'typescript'
import type { CompilerOptions, ResolvedModuleWithFailedLookupLocations } from 'typescript'
import type { ModuleResolver } from '../ModuleResolver/ModuleResolver.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { isFullySpecified } from '../IsFullySpecified/IsFullySpecified.ts'
import { joinPath } from '../JoinPath/JoinPath.ts'

const getDirName = (path: string): string => {
  return path.slice(0, path.lastIndexOf('/'))
}

const getExtension = (fileName: string): string => {
  if (fileName.endsWith('.d.ts')) {
    return '.d.ts'
  }
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1) {
    return ''
  }
  return fileName.slice(dotIndex)
}

const usesTypeScriptExtension = (moduleName: string): boolean => {
  return /\.(?:[cm]?ts|tsx)$/.test(moduleName)
}

const isNode = (path: string): boolean => {
  return path.startsWith('node:')
}

const windowsAbsolutePathRegex = /^[a-zA-Z]:\//

const toFileUri = (path: string): string => {
  const normalizedPath = path.replaceAll('\\', '/')
  if (normalizedPath.startsWith('file://')) {
    return normalizedPath
  }
  if (normalizedPath.startsWith('/')) {
    return `file://${normalizedPath}`
  }
  if (windowsAbsolutePathRegex.test(normalizedPath)) {
    return `file:///${normalizedPath}`
  }
  return normalizedPath
}

const resolveRelativePath = (containingFile: string, text: string): string => {
  const normalizedContainingFile = containingFile.replaceAll('\\', '/')
  const containingFileUri = toFileUri(containingFile)
  const resolved = new URL(text, containingFileUri)
  if (normalizedContainingFile.startsWith('file://')) {
    return resolved.href
  }
  if (normalizedContainingFile.startsWith('/')) {
    return decodeURIComponent(resolved.pathname)
  }
  if (windowsAbsolutePathRegex.test(normalizedContainingFile)) {
    return decodeURIComponent(resolved.pathname.slice(1))
  }
  return resolved.href
}

const getRelativeModuleNames = (containingFile: string, text: string): readonly string[] => {
  const normalizedContainingFile = containingFile.replaceAll('\\', '/')
  const isInNodeModules =
    normalizedContainingFile.startsWith('node_modules/') || normalizedContainingFile.includes('/node_modules/')
  const isDeclarationFile = normalizedContainingFile.endsWith('.d.ts')
  if (isInNodeModules && isDeclarationFile && text.endsWith('.ts') && !text.endsWith('.d.ts')) {
    return [`${text.slice(0, -3)}.d.ts`, text]
  }
  if (isInNodeModules && isDeclarationFile && text.endsWith('.d')) {
    return [`${text}.ts`, text]
  }
  const baseName = text.slice(text.lastIndexOf('/') + 1)
  if (isInNodeModules && isDeclarationFile && !baseName.includes('.')) {
    return [`${text}.d.ts`, `${text}.ts`]
  }
  return [text]
}

const getExistingRelativeModuleName = (syncRpc: Readonly<SyncRpc>, containingFile: string, text: string): string => {
  const relativeModuleNames = getRelativeModuleNames(containingFile, text)
  for (const relativeModuleName of relativeModuleNames) {
    const resolvedFileName = resolveRelativePath(containingFile, relativeModuleName)
    try {
      if (syncRpc.invokeSync('SyncApi.exists', resolvedFileName)) {
        return relativeModuleName
      }
    } catch {
      // Fall back to the preferred candidate when synchronous file access is unavailable.
    }
  }
  return relativeModuleNames[0]
}

const resolveModuleNameRelative = (
  syncRpc: Readonly<SyncRpc>,
  containingFile: string,
  text: string,
): ResolvedModuleWithFailedLookupLocations => {
  const relativeModuleName = getExistingRelativeModuleName(syncRpc, containingFile, text)
  const resolvedFileName = resolveRelativePath(containingFile, relativeModuleName)
  const extension = getExtension(resolvedFileName)
  return {
    resolvedModule: {
      extension,
      isExternalLibraryImport: false,
      packageId: undefined,
      resolvedFileName,
      resolvedUsingTsExtension: usesTypeScriptExtension(text),
    },
  }
}

const resolveRelativeDirectoryIndex = (
  syncRpc: Readonly<SyncRpc>,
  containingFile: string,
  text: string,
): ResolvedModuleWithFailedLookupLocations => {
  const resolvedFileName = resolveRelativePath(containingFile, `${text}index.d.ts`)
  try {
    if (!syncRpc.invokeSync('SyncApi.exists', resolvedFileName)) {
      return {
        resolvedModule: undefined,
      }
    }
  } catch {
    return {
      resolvedModule: undefined,
    }
  }
  return {
    resolvedModule: {
      extension: '.d.ts',
      isExternalLibraryImport: containingFile.includes('/node_modules/'),
      packageId: undefined,
      resolvedFileName,
      resolvedUsingTsExtension: false,
    },
  }
}

const getNodeModulesLocation = (text: string): string => {
  // TODO check that node types are in the compilerOptions, only then resolve them
  if (isNode(text)) {
    return '@types/node'
  }
  return text
}

const getNodeModulesSearchPaths = (containingFile: string): readonly string[] => {
  const searchPaths: string[] = []
  let directory = getDirName(containingFile)
  while (true) {
    searchPaths.push(directory)
    if (!directory) {
      break
    }
    directory = getDirName(directory)
  }
  return searchPaths
}

const resolveModuleNodeModules = (
  syncRpc: Readonly<SyncRpc>,
  containingFile: string,
  text: string,
): ResolvedModuleWithFailedLookupLocations => {
  const nodeModulesLocation = getNodeModulesLocation(text)
  const searchPaths = getNodeModulesSearchPaths(containingFile)
  for (const searchPath of searchPaths) {
    const nodeModulesDir = joinPath(searchPath, 'node_modules', nodeModulesLocation)
    const packageJsonPath = joinPath(nodeModulesDir, 'package.json')
    try {
      const packageJsonExists = syncRpc.invokeSync('SyncApi.exists', packageJsonPath)
      if (!packageJsonExists) {
        continue
      }
      const content = syncRpc.invokeSync('SyncApi.readFileSync', packageJsonPath)
      const parsed = JSON.parse(content)

      // TODO handle case when package JSON is null
      // TODO check types property
      const tsMain = parsed.types || parsed.main
      if (tsMain) {
        const absoluteMain = joinPath(nodeModulesDir, tsMain)
        return {
          resolvedModule: {
            extension: '.d.ts',
            isExternalLibraryImport: true,
            resolvedFileName: absoluteMain,
          },
        }
      }
    } catch {
      // Keep looking in parent directories, matching Node.js module resolution.
    }
  }

  return {
    resolvedModule: undefined,
  }
}

const createModuleResolutionHost = (syncRpc: Readonly<SyncRpc>): TypeScript.ModuleResolutionHost => {
  const exists = (path: string): boolean => {
    try {
      return Boolean(syncRpc.invokeSync('SyncApi.exists', path))
    } catch {
      return false
    }
  }
  return {
    directoryExists: exists,
    fileExists: exists,
    readFile(path) {
      try {
        return syncRpc.invokeSync('SyncApi.readFileSync', path)
      } catch {
        return undefined
      }
    },
    realpath(path) {
      return path
    },
  }
}

const resolveModuleNameWithTypeScript = (
  ts: typeof TypeScript,
  host: TypeScript.ModuleResolutionHost,
  text: string,
  containingFile: string,
  compilerOptions: CompilerOptions,
): ResolvedModuleWithFailedLookupLocations => {
  if (containingFile.startsWith('file://')) {
    return {
      resolvedModule: undefined,
    }
  }
  return ts.resolveModuleName(text, containingFile, compilerOptions, host)
}

export const createModuleResolver = (syncRpc: Readonly<SyncRpc>, ts?: typeof TypeScript): ModuleResolver => {
  const moduleResolutionHost = ts ? createModuleResolutionHost(syncRpc) : undefined
  const resolveModuleName = (
    text: string,
    containingFile: string,
    compilerOptions: CompilerOptions,
  ): ResolvedModuleWithFailedLookupLocations => {
    if (ts && moduleResolutionHost) {
      const result = resolveModuleNameWithTypeScript(ts, moduleResolutionHost, text, containingFile, compilerOptions)
      if (result.resolvedModule) {
        return result
      }
      if ((text.startsWith('./') || text.startsWith('../')) && text.endsWith('/')) {
        const directoryIndexResult = resolveRelativeDirectoryIndex(syncRpc, containingFile, text)
        if (directoryIndexResult.resolvedModule) {
          return directoryIndexResult
        }
      }
    }
    if (!isFullySpecified(text)) {
      return {
        resolvedModule: undefined,
      }
    }
    if (text.startsWith('./') || text.startsWith('../')) {
      return resolveModuleNameRelative(syncRpc, containingFile, text)
    }
    return resolveModuleNodeModules(syncRpc, containingFile, text)
  }
  return resolveModuleName
}
