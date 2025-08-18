import type { LanguageService } from 'typescript'
import type { IFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'

interface LanguageServiceItem {
  readonly languageService: LanguageService
  readonly fs: IFileSystem
}

const languageServices: Record<number, LanguageServiceItem> = Object.create(null)

export const get = (id: number): LanguageServiceItem => {
  return languageServices[id]
}

export const set = (id: number, languageService: LanguageService, fs: IFileSystem) => {
  languageServices[id] = {
    languageService,
    fs,
  }
}
