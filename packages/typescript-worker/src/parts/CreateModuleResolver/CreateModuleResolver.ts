import type { CompilerOptions, ResolvedModuleWithFailedLookupLocations } from 'typescript'
import type { ModuleResolver } from '../ModuleResolver/ModuleResolver.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { isFullySpecified } from '../IsFullySpecified/IsFullySpecified.ts'
import { joinPath } from '../JoinPath/JoinPath.ts'

type ModuleResolutionCompilerOptions = Readonly<Pick<CompilerOptions, 'rootDir'>>

const getDirName = (path: string): string => {
  return path.slice(0, path.lastIndexOf('/'))
}

const getExtension = (fileName: string): string => {
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

const resolveModuleNameRelative = (containingFile: string, text: string): ResolvedModuleWithFailedLookupLocations => {
  const resolveFileName = resolveRelativePath(containingFile, text)
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

const getNodeModulesSearchPaths = (containingFile: string, rootDir: string): readonly string[] => {
  const searchPaths: string[] = []
  let directory = getDirName(containingFile)
  while (directory) {
    searchPaths.push(directory)
    if (directory === rootDir) {
      return searchPaths
    }
    directory = getDirName(directory)
  }
  if (!searchPaths.includes(rootDir)) {
    searchPaths.push(rootDir)
  }
  return searchPaths
}

const resolveModuleNodeModules = (
  syncRpc: Readonly<SyncRpc>,
  compilerOptions: ModuleResolutionCompilerOptions,
  containingFile: string,
  text: string,
): ResolvedModuleWithFailedLookupLocations => {
  const rootDir = compilerOptions.rootDir || ''
  const nodeModulesLocation = getNodeModulesLocation(text)
  const searchPaths = getNodeModulesSearchPaths(containingFile, rootDir)
  for (const searchPath of searchPaths) {
    const nodeModulesDir = joinPath(searchPath, 'node_modules', nodeModulesLocation)
    const packageJsonPath = joinPath(nodeModulesDir, 'package.json')
    try {
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

  // TODO
  return {
    resolvedModule: {
      extension: '',
      resolvedFileName: '',
    },
  }
}

export const createModuleResolver = (syncRpc: Readonly<SyncRpc>): ModuleResolver => {
  const resolveModuleName = (
    text: string,
    containingFile: string,
    compilerOptions: ModuleResolutionCompilerOptions,
  ): ResolvedModuleWithFailedLookupLocations => {
    // console.log({ compilerOptions })
    if (!isFullySpecified(text)) {
      return {
        resolvedModule: undefined,
      }
    }
    if (text.startsWith('./') || text.startsWith('../')) {
      return resolveModuleNameRelative(containingFile, text)
    }
    return resolveModuleNodeModules(syncRpc, compilerOptions, containingFile, text)
  }
  return resolveModuleName
}
