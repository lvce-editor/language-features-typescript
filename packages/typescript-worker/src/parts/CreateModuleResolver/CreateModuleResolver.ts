import type { CompilerOptions, ResolvedModuleWithFailedLookupLocations } from 'typescript'
import type { ModuleResolver } from '../ModuleResolver/ModuleResolver.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { isFullySpecified } from '../IsFullySpecified/IsFullySpecified.ts'
import { joinPath } from '../JoinPath/JoinPath.ts'

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

const resolveModuleNameRelative = (containingFile: string, text: string): ResolvedModuleWithFailedLookupLocations => {
  const dirname = getDirName(containingFile)
  // @ts-ignore
  const resolveFileName = joinPath(dirname, text)
  const extension = getExtension(resolveFileName)
  // TODO resolve relative path
  return {
    resolvedModule: {
      extension,
      resolvedFileName: resolveFileName,
      resolvedUsingTsExtension: true,
      packageId: undefined,
      isExternalLibraryImport: false,
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

const resolveModuleNodeModules = (syncRpc: SyncRpc, compilerOptions: CompilerOptions, text: string) => {
  try {
    const rootDir = compilerOptions.rootDir || ''
    const nodeModulesLocation = getNodeModulesLocation(text)
    const nodeModulesDir = joinPath(rootDir, 'node_modules', nodeModulesLocation)
    const packageJsonPath = joinPath(nodeModulesDir, 'package.json')
    const content = syncRpc.invokeSync('SyncApi.readFileSync', packageJsonPath)
    const parsed = JSON.parse(content)

    // TODO handle case when packagejson is null
    // TODO check types property
    const tsMain = parsed.types || parsed.main
    if (tsMain) {
      const absoluteMain = joinPath(nodeModulesDir, tsMain)
      return {
        resolvedModule: {
          extension: '.d.ts',
          resolvedFileName: absoluteMain,
          isExternalLibraryImport: true,
        },
      }
    }
  } catch (error) {
    console.log({ error })
  }

  // TODO
  return {
    resolvedModule: {
      extension: '',
      resolvedFileName: '',
    },
  }
}

export const createModuleResolver = (syncRpc: SyncRpc): ModuleResolver => {
  const resolveModuleName = (
    text: string,
    containingFile: string,
    compilerOptions: CompilerOptions,
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
    return resolveModuleNodeModules(syncRpc, compilerOptions, text)
  }
  return resolveModuleName
}
