import * as FileSystem from '../FileSystem/FileSystem.js'

export const create = (ts) => {
  /**  @type {import('typescript').LanguageServiceHost} */
  const languageServiceHost = {
    getNewLine() {
      console.log('get new line')
      return '\n'
    },
    getDirectories() {
      console.log('get directories')
      return []
    },
    useCaseSensitiveFileNames() {
      return false
    },
    getProjectVersion() {
      return `${FileSystem.version}`
    },
    getScriptFileNames() {
      console.log('get script file names')
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
      console.log({ content })
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
  }
  return languageServiceHost
}
