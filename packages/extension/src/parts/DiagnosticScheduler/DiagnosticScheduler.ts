export interface Document {
  readonly documentId?: number
  readonly languageId?: string
  readonly text: string
  readonly uri: string
}

interface Pending<T> {
  readonly document: Document
  readonly promise: Promise<readonly T[]>
  readonly reject: (error: unknown) => void
  readonly resolve: (value: readonly T[]) => void
}

interface Entry<T> {
  active?: Pending<T>
  pending?: Pending<T>
  timer?: ReturnType<typeof setTimeout>
}

const isSameSnapshot = (left: Document, right: Document): boolean =>
  left.text === right.text && left.languageId === right.languageId

// Coalesce before entering the synchronous TypeScript worker. An executing
// analysis cannot be interrupted, but obsolete queued snapshots never reach it.
export const createDiagnosticScheduler = <T>(
  execute: (document: Document) => Promise<readonly T[]>,
  delayMs = 150,
): ((document: Document) => Promise<readonly T[]>) => {
  const entries = new Map<string, Entry<T>>()
  const schedule = (key: string, entry: Entry<T>): void => {
    if (entry.active) return
    clearTimeout(entry.timer)
    entry.timer = setTimeout(async () => {
      entry.timer = undefined
      const request = entry.pending
      entry.pending = undefined
      entry.active = request
      try {
        const result = await execute(request.document)
        request.resolve(entry.pending ? [] : result)
      } catch (error) {
        request.reject(error)
      } finally {
        entry.active = undefined
        if (entry.pending) schedule(key, entry)
        else entries.delete(key)
      }
    }, delayMs)
  }
  return (document) => {
    const key = JSON.stringify([document.uri, document.documentId])
    const entry: Entry<T> = entries.get(key) || {}
    entries.set(key, entry)
    if (entry.pending && isSameSnapshot(entry.pending.document, document)) {
      return entry.pending.promise
    }
    entry.pending?.resolve([])
    if (entry.active && isSameSnapshot(entry.active.document, document)) {
      entry.pending = undefined
      return entry.active.promise
    }
    const { promise, reject, resolve } = Promise.withResolvers<readonly T[]>()
    entry.pending = { document, promise, reject, resolve }
    schedule(key, entry)
    return promise
  }
}
