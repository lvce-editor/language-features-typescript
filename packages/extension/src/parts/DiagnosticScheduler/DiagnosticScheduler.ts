export interface Document {
  readonly documentId?: number
  readonly text: string
  readonly uri: string
}

interface Pending<T> {
  readonly document: Document
  readonly reject: (error: unknown) => void
  readonly resolve: (value: readonly T[]) => void
}

interface Entry<T> {
  pending?: Pending<T>
  running: boolean
  timer?: ReturnType<typeof setTimeout>
}

// Coalesce before entering the synchronous TypeScript worker. An executing
// analysis cannot be interrupted, but obsolete queued snapshots never reach it.
export const createDiagnosticScheduler = <T>(
  execute: (document: Document) => Promise<readonly T[]>,
  delayMs = 150,
): ((document: Document) => Promise<readonly T[]>) => {
  const entries = new Map<string, Entry<T>>()
  const schedule = (key: string, entry: Entry<T>): void => {
    if (entry.running) return
    clearTimeout(entry.timer)
    entry.timer = setTimeout(async () => {
      entry.timer = undefined
      const request = entry.pending
      entry.pending = undefined
      entry.running = true
      try {
        const result = await execute(request.document)
        if (entry.pending?.document.text === request.document.text) {
          throw new Error(
            `E2E identical active diagnostics discarded: ${JSON.stringify({ uri: request.document.uri, documentId: request.document.documentId })}`,
          )
        }
        request.resolve(entry.pending ? [] : result)
      } catch (error) {
        request.reject(error)
      } finally {
        entry.running = false
        if (entry.pending) schedule(key, entry)
        else entries.delete(key)
      }
    }, delayMs)
  }
  return (document) => {
    const key = JSON.stringify([document.uri, document.documentId])
    const entry = entries.get(key) || { running: false }
    entries.set(key, entry)
    if (entry.pending?.document.text === document.text) {
      entry.pending.reject(
        new Error(
          `E2E identical pending diagnostics discarded: ${JSON.stringify({ uri: document.uri, documentId: document.documentId })}`,
        ),
      )
    } else {
      entry.pending?.resolve([])
    }
    return new Promise((resolve, reject) => {
      entry.pending = { document, reject, resolve }
      schedule(key, entry)
    })
  }
}
