import type { ResolvedModuleWithFailedLookupLocations } from 'typescript'
import type { ModuleResolver } from '../ModuleResolver/ModuleResolver.ts'
import { isFullySpecified } from '../IsFullySpecified/IsFullySpecified.ts'

export const createModuleResolver = (): ModuleResolver => {
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
