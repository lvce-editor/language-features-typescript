import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'

export const createFileSystem = (readSavedFile?: (uri: string) => string | undefined): IFileSystem => {
  const files: Record<string, string> = Object.create(null)
  const versions: Record<string, number> = Object.create(null)
  const saved = new Set<string>()
  let version = 0
  let diskVersion = 0
  const fileSystem: IFileSystem = {
    getScriptFileNames() {
      return Object.keys(files)
    },
    getScriptVersion(uri) {
      return versions[uri]?.toString() ?? `disk:${diskVersion}`
    },
    getVersion() {
      return version.toString()
    },
    readFile(uri) {
      return files[uri]
    },
    releaseFile(uri) {
      if (!(uri in files)) return false
      // A prior equality proves this override was saved, even if disk changed
      // after the tab closed. Unknown/different contents are kept conservatively.
      if (!saved.has(uri)) {
        try {
          if (!readSavedFile || readSavedFile(uri) !== files[uri]) return false
        } catch {
          return false
        }
      }
      delete files[uri]
      delete versions[uri]
      saved.delete(uri)
      version++
      diskVersion++
      return true
    },
    writeFile(uri, content) {
      if (files[uri] === content) {
        return
      }
      files[uri] = content
      versions[uri] = ++version
      saved.delete(uri)
      try {
        if (readSavedFile && readSavedFile(uri) === content) saved.add(uri)
      } catch {
        // Unreadable and untitled documents retain their overrides.
      }
    },
  }
  return fileSystem
}
