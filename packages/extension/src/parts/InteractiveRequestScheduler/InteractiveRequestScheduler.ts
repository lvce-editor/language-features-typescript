import type { Document } from '../DiagnosticScheduler/DiagnosticScheduler.ts'

interface Request<T> {
  readonly document: Document
  readonly offset: number
  readonly reject: (error: unknown) => void
  readonly resolve: (value: T | null) => void
}

interface Entry<T> {
  active?: Request<T>
  latest?: Request<T>
  pending?: Request<T>
  timer?: ReturnType<typeof setTimeout>
}

// Keep the queue outside the synchronous worker: an executing TypeScript call
// cannot be interrupted, but only the newest pending position needs analysis.
export const createInteractiveRequestScheduler = <T>(
  execute: (document: Document, offset: number) => Promise<T>,
  delayMs = 20,
): ((document: Document, offset: number) => Promise<T | null>) => {
  const entries = new Map<string, Entry<T>>()
  const schedule = (key: string, entry: Entry<T>): void => {
    if (entry.active || entry.timer !== undefined) return
    entry.timer = setTimeout(async () => {
      entry.timer = undefined
      const request = entry.pending
      entry.pending = undefined
      entry.active = request
      try {
        const result = await execute(request.document, request.offset)
        if (entry.latest === request) request.resolve(result ?? null)
      } catch (error) {
        if (entry.latest === request) request.reject(error)
      } finally {
        entry.active = undefined
        if (entry.pending) schedule(key, entry)
        else entries.delete(key)
      }
    }, delayMs)
  }
  return (document, offset) => {
    const key = JSON.stringify([document.uri, document.documentId])
    const entry: Entry<T> = entries.get(key) || {}
    entries.set(key, entry)
    // Settle obsolete callers now, before the latest result can update the UI.
    entry.latest?.resolve(null)
    const { promise, reject, resolve } = Promise.withResolvers<T | null>()
    entry.latest = entry.pending = { document, offset, reject, resolve }
    schedule(key, entry)
    return promise
  }
}
