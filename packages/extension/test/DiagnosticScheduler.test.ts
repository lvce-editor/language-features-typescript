import { afterEach, expect, jest, test } from '@jest/globals'
import { createDiagnosticScheduler } from '../src/parts/DiagnosticScheduler/DiagnosticScheduler.ts'

afterEach(() => jest.useRealTimers())
const document = (text: string, uri = '/main.ts', documentId = 1) => ({ documentId, text, uri })

test('rapid edits dispatch only the latest document and leave other documents independent', async () => {
  jest.useFakeTimers()
  const seen: string[] = []
  const schedule = createDiagnosticScheduler(async (doc) => {
    seen.push(doc.text)
    return [doc.text]
  })
  const pending = Array.from({ length: 10 }, (_, i) => schedule(document(String(i))))
  const other = schedule(document('other', '/other.ts'))
  const duplicateTab = schedule(document('tab', '/main.ts', 2))
  await jest.advanceTimersByTimeAsync(150)
  expect(seen).toEqual(['9', 'other', 'tab'])
  expect(await Promise.all(pending)).toEqual([...Array.from({ length: 9 }, () => []), ['9']])
  expect(await other).toEqual(['other'])
  expect(await duplicateTab).toEqual(['tab'])
})

test('during an active job only one latest successor runs and failures do not strand it', async () => {
  jest.useFakeTimers()
  const active = Promise.withResolvers<readonly string[]>()
  const seen: string[] = []
  const schedule = createDiagnosticScheduler(async (doc) => {
    seen.push(doc.text)
    return doc.text === 'first' ? active.promise : [doc.text]
  })
  const first = schedule(document('first'))
  const handledFirst = (async () => {
    try {
      return await first
    } catch (error) {
      return (error as Error).message
    }
  })()
  await jest.advanceTimersByTimeAsync(150)
  const superseded = schedule(document('obsolete'))
  const latest = schedule(document('latest'))
  await jest.advanceTimersByTimeAsync(1000)
  expect(seen).toEqual(['first'])
  active.reject(new Error('provider failed'))
  await jest.advanceTimersByTimeAsync(150)
  expect(await handledFirst).toBe('provider failed')
  expect(await superseded).toEqual([])
  expect(await latest).toEqual(['latest'])
  expect(seen).toEqual(['first', 'latest'])
  const next = schedule(document('next'))
  await jest.advanceTimersByTimeAsync(150)
  expect(await next).toEqual(['next'])
})

test('successful obsolete active result is suppressed while the newest analysis completes', async () => {
  jest.useFakeTimers()
  const active = Promise.withResolvers<readonly string[]>()
  const schedule = createDiagnosticScheduler(async (doc) => (doc.text === 'first' ? active.promise : [doc.text]))
  const first = schedule(document('first'))
  await jest.advanceTimersByTimeAsync(150)
  const latest = schedule(document('latest'))
  active.resolve(['obsolete error'])
  await jest.advanceTimersByTimeAsync(150)
  expect(await first).toEqual([])
  expect(await latest).toEqual(['latest'])
})
