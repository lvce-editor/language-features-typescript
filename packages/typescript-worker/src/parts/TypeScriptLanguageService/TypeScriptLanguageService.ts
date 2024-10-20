import type { LanguageServiceHost } from 'typescript'
import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.ts'
import * as TypeScriptUrl from '../TypeScriptUrl/TypeScriptUrl.ts'

const ts = await LoadTypeScript.loadTypeScript(TypeScriptUrl.typeScriptUrl)

const languageServiceHost: LanguageServiceHost = {
  readFile(path) {
    return ''
  },
  fileExists(path) {
    return true
  },
  getNewLine() {
    return '\n'
  },
  getDirectories() {
    return []
  },
  useCaseSensitiveFileNames() {
    return false
  },
  getProjectVersion() {
    return `${FileSystem.getVersion()}`
  },
  getScriptFileNames() {
    return FileSystem.getAllFiles()
  },
  getScriptVersion(fileName) {
    return FileSystem.readVersion(fileName)
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
    return '/' + ts.getDefaultLibFileName(options)
  },
  getScriptSnapshot(fileName) {
    const content = FileSystem.readFile(fileName)
    const snapshot = ts.ScriptSnapshot.fromString(content)
    return snapshot
  },
}

export const languageService = ts.createLanguageService(languageServiceHost, undefined, false)
