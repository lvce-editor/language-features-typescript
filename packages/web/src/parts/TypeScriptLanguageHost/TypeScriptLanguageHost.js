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
      console.log('get new line')
      return '\n'
    },
    getDirectories(x) {
      console.log('get directories', x)
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
      console.log({ files })
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
      console.log({ defaultLibFileName })
      return defaultLibFileName
    },
    getScriptSnapshot(fileName) {
      if (fileName === '/lib.d.ts') {
        return ts.ScriptSnapshot.fromString('')
      }
      const content = FileSystem.readFile(fileName)
      console.log({ content, fileName })
      if (!content) {
        return undefined
      }
      const snapshot = ts.ScriptSnapshot.fromString(content)
      return snapshot
    },
  }
  return languageServiceHost
}
