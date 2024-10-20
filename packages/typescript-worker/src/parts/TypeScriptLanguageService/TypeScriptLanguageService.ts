import type { LanguageServiceHost, LanguageService } from 'typescript'
import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.ts'
import * as TypeScriptUrl from '../TypeScriptUrl/TypeScriptUrl.ts'

const ts = await LoadTypeScript.loadTypeScript(TypeScriptUrl.typeScriptUrl)

const fixPath = (path: string) => {
  if (path.startsWith('/node_modules/@typescript')) {
    return path
  }
  return path
}

const realpath = (path: string) => {}

const languageServiceHost: LanguageServiceHost = {
  directoryExists(directoryName) {
    console.log({ directoryExists: directoryName })
    return false
  },
  readDirectory(path) {
    console.log({ readDirectory: path })
    return []
  },
  realpath(path) {
    console.log({ realPath: path })
    return path
  },
  readFile(path) {
    console.log({ readFile: path })
    return ''
  },
  fileExists(path) {
    console.log({ exists: path })
    return true
  },
  getNewLine() {
    return '\n'
  },
  getDirectories(args) {
    console.log({ getDirectories: args })
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
    const name = ts.getDefaultLibFileName(options)
    console.log({ options, name })
    return '/' + name
  },
  getScriptSnapshot(fileName) {
    const content = FileSystem.readFile(fileName)
    const snapshot = ts.ScriptSnapshot.fromString(content)
    console.log({
      getSnapshot: fileName,
      content,
    })
    return snapshot
  },
}

export const languageService: LanguageService = ts.createLanguageService(languageServiceHost, undefined, false)
