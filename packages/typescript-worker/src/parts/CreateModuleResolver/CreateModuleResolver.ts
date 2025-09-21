import type { CompilerOptions, ParsedCommandLine, ResolvedModuleWithFailedLookupLocations } from 'typescript'
import type { ModuleResolver } from '../ModuleResolver/ModuleResolver.ts'
import { isFullySpecified } from '../IsFullySpecified/IsFullySpecified.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

const joinPath = (...parts: readonly string[]): string => {
  // TODO handle relative parts like ../ or ./
  return parts.join('/')
}

export const createModuleResolver = (syncRpc: SyncRpc): ModuleResolver => {
  const resolveModuleName = (
    text: string,
    containingFile: string,
    compilerOptions: CompilerOptions,
  ): ResolvedModuleWithFailedLookupLocations => {
    if (!isFullySpecified(text)) {
      return {
        resolvedModule: undefined,
      }
    }
    if (text.startsWith('./') || text.startsWith('../')) {
      // TODO resolve relative path
    }
    try {
      const rootDir = compilerOptions.rootDir || ''
      const packageJsonPath = joinPath(rootDir, 'node_modules', text, 'package.json')
      const content = syncRpc.invokeSync('SyncApi.readFileSync', packageJsonPath)
      const parsed = JSON.parse(content)

      // TODO handle case when packagejson is null
      // TODO check types property
      const tsMain = parsed.types || parsed.main
      if (tsMain) {
        const absoluteMain = joinPath(rootDir, 'node_modules', text, tsMain)
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
  return resolveModuleName
}
