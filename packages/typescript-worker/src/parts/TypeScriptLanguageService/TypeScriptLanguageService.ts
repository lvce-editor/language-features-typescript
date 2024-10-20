import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.ts'
import * as TypeScriptUrl from '../TypeScriptUrl/TypeScriptUrl.ts'

const ts = await LoadTypeScript.loadTypeScript(TypeScriptUrl.typeScriptUrl)

const getTextSync = (url) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', /* url */ url, /* async */ false)
  xhr.send(null)
  return xhr.responseText
}

const fileSystem = {
  version: 0,
  // "/index.ts": "",
  files: Object.create(null),
  getAllFiles() {
    return Object.keys(this.files)
  },
  writeFile(path, content) {
    this.version++
    const existing = this.files[path]
    if (existing) {
      existing.text = content
      existing.version++
    } else {
      this.files[path] = {
        text: content,
        version: 0,
      }
    }
  },
  readFile(path) {
    const file = this.files[path]
    if (!file) {
      if (path.startsWith('/lib')) {
        path = `${TypeScriptUrl.typescriptBaseUrl}/lib${path}`
        const text = getTextSync(path) // typescript only supports synchronous file system
        return text
      }
      console.info(`[info] file ${path} not found`)
      return ''
    }
    return file.text
  },
  readVersion(path) {
    const file = this.files[path]
    if (!file) {
      return '0'
    }
    return file.version
  },
}

/**  @type {import('typescript').LanguageServiceHost} */
const languageServiceHost = {
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
    return `${fileSystem.version}`
  },
  getScriptFileNames() {
    return fileSystem.getAllFiles()
  },
  getScriptVersion(fileName) {
    return fileSystem.readVersion(fileName)
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
    const content = fileSystem.readFile(fileName)
    const snapshot = ts.ScriptSnapshot.fromString(content)
    return snapshot
  },
}

const languageService = ts.createLanguageService(languageServiceHost, undefined, false)

export { fileSystem, languageService }
