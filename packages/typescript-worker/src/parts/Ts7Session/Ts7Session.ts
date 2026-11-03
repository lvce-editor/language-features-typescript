import { DiagnosticTag } from '@lvce-editor/api'
import { createFileSystemLayer, serverFS, type FileSystemCallbacks } from 'typescript7/fs'
import { API, documentURIToFileName, fileNameToDocumentURI, type Diagnostic } from 'typescript7/sync'
import { WasmTransport, type WasmReactorInstance } from 'typescript7/wasm'
import { getDiagnosticSeverity } from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'
import { createFeatures } from '../Ts7Features/Ts7Features.ts'
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

const messageText = (diagnostic: Diagnostic, depth = 0): string => {
  let { text } = diagnostic
  const children = diagnostic.messageChain ?? []
  for (const child of children) {
    text += `\n${'  '.repeat(depth + 1)}${messageText(child, depth + 1)}`
  }
  return text
}

const identifierPrefix = (text: string, offset: number): string => {
  const identifier = /^[$\p{ID_Continue}]$/u
  let start = offset
  while (start > 0) {
    const last = text.codePointAt(start - 1) ?? 0
    const width = last >= 0xdc_00 && last <= 0xdf_ff && start > 1 ? 2 : 1
    if (!identifier.test(text.slice(start - width, start))) break
    start -= width
  }
  return text.slice(start, offset)
}

const hasDrive = (url: URL): boolean => /^\/[a-z](?::|%3a)\//i.test(url.pathname)
export const getHostUri = (path: string, documentUrl: URL): string | undefined => {
  const uri = fileNameToDocumentURI(path)
  if (!uri.startsWith('file:')) return uri
  // The WASM cwd is synthetic. Its root-level type probes must not escape a
  // virtual filesystem or become drive-less file URLs on Windows.
  if (documentUrl.protocol !== 'file:') return undefined
  const target = new URL(uri)
  if ((hasDrive(documentUrl) || documentUrl.hostname) && !hasDrive(target) && !target.hostname) return undefined
  return uri
}

/** One compiler session; each request receives a fresh, immutable project snapshot. */
export const createSession = (
  instance: WasmReactorInstance,
  libraries: Record<string, string>,
  host: Host,
  libraryUri = (name: string) => 'bundled:///libs/' + name,
) => {
  const libraryRoot = 'bundled:///libs/'
  const documents = new Map<string, string>()
  const savedDocuments = new Set<string>()
  let documentUrl = new URL('file:///')
  // Cache only within a request. Changes on disk and failed lookups are rechecked
  // on the next request, without relying on a watcher being available on the web.
  const files = new Map<string, string | undefined>()
  const directories = new Map<string, { files: string[]; directories: string[] } | undefined>()
  const readFile = (path: string): string | undefined => {
    if (path.startsWith(libraryRoot)) return libraries[path.slice(libraryRoot.length)]
    if (!files.has(path)) {
      const uri = getHostUri(path, documentUrl)
      files.set(path, uri ? host.readFile(uri) : undefined)
    }
    return files.get(path)
  }
  const readDirectory = (path: string) => {
    if (path === libraryRoot.slice(0, -1) || path === libraryRoot) {
      return { directories: [], files: Object.keys(libraries) }
    }
    if (!directories.has(path)) {
      const uri = getHostUri(path, documentUrl)
      directories.set(path, uri ? host.readDirectory(uri) : undefined)
    }
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
  const findProject = (uri: string): string | undefined => {
    let directory: URL
    try {
      directory = new URL('.', uri)
    } catch {
      return undefined
    }
    while (true) {
      for (const name of ['tsconfig.json', 'jsconfig.json']) {
        const path = documentURIToFileName(new URL(name, directory).href)
        if (readFile(path) !== undefined) return path
      }
      const parent = new URL('../', directory)
      if (parent.href === directory.href) return undefined
      directory = parent
    }
  }
  const prepare = (document: Document, openUris: readonly string[]) => {
    documentUrl = new URL(document.uri)
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
    const config = findProject(document.uri)
    const snapshot = api.createSnapshot({
      fileSystem: createFileSystemLayer(
        Array.from(documents, ([uri, text]) => [documentURIToFileName(uri), text] as const),
      ),
      openFiles: [documentURIToFileName(document.uri)],
      ...(config && { openProjects: [config] }),
      userPreferences: { importModuleSpecifierEnding: 'js' },
    })
    try {
      const path = documentURIToFileName(document.uri)
      const configured = config ? snapshot.getConfiguredProject(config) : undefined
      // Native auto-selection treats virtual URIs as inferred files. Use the
      // explicitly opened config only when its program contains this document.
      const project = configured?.program.getSourceFile(path) ? configured : snapshot.getDefaultProjectForFile(path)
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
        const prefix = identifierPrefix(document.text, offset)
        const rank = (name: string): number => {
          if (name.startsWith(prefix)) return 0
          if (name.toLowerCase().startsWith(prefix.toLowerCase())) return 1
          return 2
        }
        const entries = (result?.entries ?? []).toSorted(
          (left, right) =>
            (left.sortText ?? '').localeCompare(right.sortText ?? '') ||
            rank(left.name) - rank(right.name) ||
            left.name.localeCompare(right.name, 'en'),
        )
        return entries.map((entry) => ({
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
    feature<T>(
      document: Document,
      openUris: readonly string[],
      execute: (features: ReturnType<typeof createFeatures>) => T,
    ): T {
      const { project, snapshot } = prepare(document, openUris)
      try {
        const source = project.program.getSourceFile(documentURIToFileName(document.uri))
        if (!source) throw new Error(`TypeScript 7 could not load ${document.uri}`)
        return execute(createFeatures(project, source, libraryUri))
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
            const relatedInformation = item.relatedInformation?.flatMap((related) => {
              if (!related.fileName || !related.startPosition || !related.endPosition) return []
              return [
                {
                  columnIndex: related.startPosition.character,
                  endColumnIndex: related.endPosition.character,
                  endRowIndex: related.endPosition.line,
                  message: messageText(related),
                  rowIndex: related.startPosition.line,
                  uri: fileNameToDocumentURI(related.fileName),
                },
              ]
            })
            return {
              ...start,
              code: item.code,
              endColumnIndex: end.columnIndex,
              endRowIndex: end.rowIndex,
              message: messageText(item),
              ...(relatedInformation?.length && { relatedInformation }),
              source: 'ts',
              ...(item.reportsUnnecessary && { tags: [DiagnosticTag.Unnecessary] }),
              type: getDiagnosticSeverity(item),
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
