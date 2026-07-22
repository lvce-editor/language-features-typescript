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
  const containingFileUri = toFileUri(containingFile)
  return new URL(text, containingFileUri).href
}

const getRelativeModuleName = (containingFile: string, text: string): string => {
  const normalizedContainingFile = containingFile.replaceAll('\\', '/')
  const isInNodeModules =
    normalizedContainingFile.startsWith('node_modules/') || normalizedContainingFile.includes('/node_modules/')
  const isDeclarationFile = normalizedContainingFile.endsWith('.d.ts')
  if (isInNodeModules && isDeclarationFile && text.endsWith('.ts') && !text.endsWith('.d.ts')) {
    return `${text.slice(0, -3)}.d.ts`
  }
  const baseName = text.slice(text.lastIndexOf('/') + 1)
  if (isInNodeModules && isDeclarationFile && !baseName.includes('.')) {
    return `${text}.d.ts`
  }
  return text
}

const resolveModuleNameRelative = (containingFile: string, text: string): ResolvedModuleWithFailedLookupLocations => {
  const relativeModuleName = getRelativeModuleName(containingFile, text)
  const resolveFileName = resolveRelativePath(containingFile, relativeModuleName)
  const extension = getExtension(resolveFileName)
  return {
    resolvedModule: {
      extension,
      isExternalLibraryImport: false,
      packageId: undefined,
      resolvedFileName: resolveFileName,
      resolvedUsingTsExtension: true,
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

export const createModuleResolver = (syncRpc: Readonly<SyncRpc>): ModuleResolver => {
  const resolveModuleName = (
    text: string,
    containingFile: string,
    _compilerOptions: CompilerOptions,
  ): ResolvedModuleWithFailedLookupLocations => {
    if (!isFullySpecified(text)) {
      return {
        resolvedModule: undefined,
      }
    }
    if (text.startsWith('./') || text.startsWith('../')) {
      return resolveModuleNameRelative(containingFile, text)
    }
    return resolveModuleNodeModules(syncRpc, containingFile, text)
  }
  return resolveModuleName
}
