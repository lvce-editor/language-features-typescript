import { createFileSystemLayer, serverFS, type FileSystemCallbacks } from 'typescript7/fs'
import { API, documentURIToFileName, fileNameToDocumentURI } from 'typescript7/sync'
import { WasmTransport, type WasmReactorInstance } from 'typescript7/wasm'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

export interface Document {
  readonly text: string
  readonly uri: string
}

export interface Host {
  readDirectory(uri: string): { files: string[]; directories: string[] } | undefined
  readFile(uri: string): string | undefined
}

export const version = '7.1.0-dev.20261030.1'

/** One compiler session; each request receives a fresh, immutable project snapshot. */
export const createSession = (instance: WasmReactorInstance, libraries: Record<string, string>, host: Host) => {
  const libraryRoot = 'bundled:///libs/'
  const documents = new Map<string, string>()
  const savedDocuments = new Set<string>()
  // Cache only within a request. Changes on disk and failed lookups are rechecked
  // on the next request, without relying on a watcher being available on the web.
  const files = new Map<string, string | undefined>()
  const directories = new Map<string, { files: string[]; directories: string[] } | undefined>()
  const readFile = (path: string): string | undefined => {
    if (path.startsWith(libraryRoot)) return libraries[path.slice(libraryRoot.length)]
    if (!files.has(path)) files.set(path, host.readFile(fileNameToDocumentURI(path)))
    return files.get(path)
  }
  const readDirectory = (path: string) => {
    if (path === libraryRoot.slice(0, -1) || path === libraryRoot) {
      return { directories: [], files: Object.keys(libraries) }
    }
    if (!directories.has(path)) directories.set(path, host.readDirectory(fileNameToDocumentURI(path)))
    return directories.get(path)
  }
  const fs: FileSystemCallbacks = {
    directoryExists(path) {
      return readDirectory(path) !== undefined
    },
    fileExists: (path) => readFile(path) !== undefined,
    getAccessibleEntries(path) {
      return { ...(readDirectory(path) ?? { directories: [], files: [] }), symlinks: undefined }
    },
    readFile,
    realpath: serverFS.identity,
    removeFile: serverFS.error,
    stat: serverFS.fakeStat,
    writeFile: serverFS.error,
  }
  const transport = new WasmTransport({ cwd: '/', fs, instance })
  const api = new API({ transport })
  const prepare = (document: Document, openUris: readonly string[]) => {
    files.clear()
    directories.clear()
    for (const uri of documents.keys()) {
      // Preview tabs and older hosts can omit dirty documents from their tab
      // snapshot. Retire only overrides known to have reached the filesystem.
      if (!(
        !openUris.includes(uri) &&
        uri !== document.uri &&
        (savedDocuments.has(uri) || host.readFile(uri) === documents.get(uri))
      )) {
        continue
      }

      documents.delete(uri)
      savedDocuments.delete(uri)
    }
    if (documents.get(document.uri) !== document.text) savedDocuments.delete(document.uri)
    documents.set(document.uri, document.text)
    if (host.readFile(document.uri) === document.text) savedDocuments.add(document.uri)
    const snapshot = api.createSnapshot({
      fileSystem: createFileSystemLayer(
        Array.from(documents, ([uri, text]) => [documentURIToFileName(uri), text] as const),
      ),
      openFiles: [documentURIToFileName(document.uri)],
    })
    try {
      const project = snapshot.getDefaultProjectForFile(documentURIToFileName(document.uri))
      if (!project) throw new Error(`TypeScript 7 could not load a project for ${document.uri}`)
      return { project, snapshot }
    } catch (error) {
      snapshot.dispose()
      throw error
    }
  }
  return {
    close() {
      api.close()
      documents.clear()
      savedDocuments.clear()
      files.clear()
      directories.clear()
    },
    completion(document: Document, offset: number, openUris: readonly string[]) {
      const { project, snapshot } = prepare(document, openUris)
      try {
        const result = project.languageService.getCompletionsAtPosition(documentURIToFileName(document.uri), offset)
        return (result?.entries ?? []).map((entry) => ({
          completionName: entry.name,
          detail: entry.detail,
          filterText: entry.filterText,
          flags: 0,
          kind: entry.kind ?? 0,
          label: entry.name,
          snippet: entry.insertText ?? entry.name,
          sortText: entry.sortText,
          source: 'ts',
        }))
      } finally {
        snapshot.dispose()
      }
    },
    diagnostics(document: Document, openUris: readonly string[]) {
      const { project, snapshot } = prepare(document, openUris)
      try {
        const path = documentURIToFileName(document.uri)
        const result = [
          ...project.program.getSyntacticDiagnostics(path),
          ...project.program.getSemanticDiagnostics(path),
        ]
        return result
          .filter((item) => String(item.fileName) === path)
          .map((item) => {
            const start = item.startPosition
              ? { columnIndex: item.startPosition.character, rowIndex: item.startPosition.line }
              : getPositionAt(document.text, item.pos)
            const end = item.endPosition
              ? { columnIndex: item.endPosition.character, rowIndex: item.endPosition.line }
              : getPositionAt(document.text, item.end)
            return {
              ...start,
              code: item.code,
              endColumnIndex: end.columnIndex,
              endRowIndex: end.rowIndex,
              message: item.text,
              source: 'ts',
              type: item.category === 1 ? 'error' : 'warning',
              uri: document.uri,
            }
          })
      } finally {
        snapshot.dispose()
      }
    },
    statistics() {
      return {
        openDocumentCount: documents.size,
        wasmMemoryBytes: (instance.exports as { memory: WebAssembly.Memory }).memory.buffer.byteLength,
      }
    },
  }
}
