import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

interface LanguageServiceItem {
  readonly fs: IFileSystem
  readonly client: SyncRpc
  readonly ts: typeof import('typescript')
}

const languageServices: Record<number, LanguageServiceItem> = Object.create(null)

export const get = (id: number): LanguageServiceItem => {
  return languageServices[id]
}

export const set = (id: number, fs: IFileSystem, client: SyncRpc, ts: typeof import('typescript')) => {
  languageServices[id] = {
    fs,
    client,
    ts,
  }
}
