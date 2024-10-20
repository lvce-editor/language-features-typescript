import type { LanguageServiceHost, LanguageService } from 'typescript'
import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.ts'
import * as TypeScriptUrl from '../TypeScriptUrl/TypeScriptUrl.ts'
import * as GetRealPath from '../GetRealPath/GetRealPath.ts'

const ts = await LoadTypeScript.loadTypeScript(TypeScriptUrl.typeScriptUrl)

const fixPath = (path: string) => {
  if (path.startsWith('/node_modules/@typescript')) {
    return path
  }
  return path
}

const realpath = (path: string) => {
  console.log({ realPath: path })

  return path
}

const languageServiceHost: LanguageServiceHost = {
  directoryExists(directoryName) {
    if (directoryName === 'memfs:///workspace/') {
      return true
    }
    console.log({ directoryExists: directoryName })
    return false
  },
  readDirectory(path) {
    console.log({ readDirectory: path })
    return []
  },
  realpath: GetRealPath.getRealPath,
  readFile(path) {
    console.log({ readFile: path })
    return ''
  },
  fileExists(path) {
    const exists = FileSystem.exists(path)
    console.log({ exists, path })
    return exists
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
    const names = FileSystem.getAllFiles()
    return names
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
