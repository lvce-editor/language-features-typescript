import type { ResolvedModuleWithFailedLookupLocations } from 'typescript'

export interface ModuleResolver {
  (text: string, containingFile: any, compilerOptions: any): ResolvedModuleWithFailedLookupLocations
}
