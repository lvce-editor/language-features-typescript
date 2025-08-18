import type { LanguageServiceHost } from 'typescript'
import type { IFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'

export interface ILanguageServiceHost extends LanguageServiceHost {}

export const create = (ts: typeof import('typescript'), fileSystem: IFileSystem): ILanguageServiceHost => {
  const languageServiceHost: ILanguageServiceHost = {
    fileExists(path) {
      return true
    },
    readFile(path) {
      return ''
    },
    getNewLine() {
      return '\n'
    },
    getDirectories(x) {
      return []
    },
    useCaseSensitiveFileNames() {
      return false
    },
    getProjectVersion() {
      return `${fileSystem.getVersion()}`
    },
    getScriptFileNames() {
      const files = fileSystem.getScriptFileNames() as string[]
      return files
    },
    getScriptVersion(fileName) {
      return fileSystem.getScriptVersion(fileName)
    },
    writeFile(fileName, content) {
      throw new Error('not implemented')
    },
    getCompilationSettings() {
      return ts.getDefaultCompilerOptions()
    },
    getCustomTransformers() {
      throw new Error('not implemented')
    },
    getCurrentDirectory() {
      return '/'
    },
    getDefaultLibFileName(options) {
      const defaultLibFileName = '/' + ts.getDefaultLibFileName(options)
      return defaultLibFileName
    },
    getScriptSnapshot(fileName) {
      if (fileName === '/lib.d.ts' || fileName.startsWith('/node_modules/@typescript/lib')) {
        const content = readLibFile(fileName)
        return ts.ScriptSnapshot.fromString(content)
      }
      const content = fileSystem.readFile(fileName)
      if (!content) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
  }
  return languageServiceHost
}
