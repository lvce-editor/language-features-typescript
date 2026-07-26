import type * as TypeScript from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

interface LanguageServiceItem {
  readonly client: SyncRpc
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
    fs,
    ts,
  }
}
