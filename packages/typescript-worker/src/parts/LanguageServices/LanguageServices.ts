import type * as TypeScript from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

interface LanguageServiceItem {
  readonly client: SyncRpc
  documentRegistry: TypeScript.DocumentRegistry
  readonly fs: IFileSystem
  readonly ts: typeof TypeScript
}

const languageServices: Record<number, LanguageServiceItem> = Object.create(null)

export const get = (id: number): LanguageServiceItem => {
  return languageServices[id]
}

export const set = (id: number, fs: IFileSystem, client: SyncRpc, ts: typeof TypeScript) => {
  languageServices[id] = {
    client,
    documentRegistry: ts.createDocumentRegistry(true, ''),
    fs,
    ts,
  }
}

export const resetDocumentRegistry = (id: number): void => {
  const languageService = languageServices[id]
  if (!languageService) return
  languageService.documentRegistry = languageService.ts.createDocumentRegistry(true, '')
}
