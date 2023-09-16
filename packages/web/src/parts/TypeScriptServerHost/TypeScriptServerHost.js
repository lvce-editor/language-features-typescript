/**
 * @returns {import('typescript/lib/tsserverlibrary.js').server.ServerHost}
 */
export const create = () => {
  return {
    watchFile(path, callback) {
      return {
        close() {},
      }
    },
    watchDirectory(path, callback) {
      return {
        close() {},
      }
    },
    setTimeout(callback, ms) {},
    clearTimeout(timeoutId) {},
    clearImmediate(timeoutId) {},
    setImmediate(callback) {},

    args: [],
    newLine: '\n',
    useCaseSensitiveFileNames: true,
    write(s) {},
    writeOutputIsTTY() {
      return true
    },
    readFile(path) {
      return undefined
    },
    writeFile(path, data) {},
    resolvePath(path) {
      return path
    },
    fileExists(path) {
      return true
    },
    directoryExists(path) {
      return true
    },
    createDirectory(path) {},
    exit() {},
    getCurrentDirectory() {
      return '/workspace'
    },
    getDirectories(path) {
      return []
    },
    getExecutingFilePath() {
      return ''
    },
    readDirectory(path) {
      return []
    },
  }
}
