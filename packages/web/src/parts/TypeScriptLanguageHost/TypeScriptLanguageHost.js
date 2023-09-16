import * as FileSystem from '../FileSystem/FileSystem.js'

export const create = (ts) => {
  /**  @type {import('typescript').LanguageServiceHost} */
  const languageServiceHost = {
    fileExists(path) {
      console.log({ path })
      return true
    },
    readFile(path) {
      console.log({ path })
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
      return `${FileSystem.getVersion()}`
    },
    getScriptFileNames() {
      const files = FileSystem.getAllFiles()
      return files
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
      const defaultLibFileName = '/' + ts.getDefaultLibFileName(options)
      return defaultLibFileName
    },
    getScriptSnapshot(fileName) {
      const content = FileSystem.readFile(fileName)
      if (!content) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
  }
  return languageServiceHost
}
