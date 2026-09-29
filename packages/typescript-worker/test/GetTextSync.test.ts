import { expect, jest, test } from '@jest/globals'
import { getTextSync } from '../src/parts/GetTextSync/GetTextSync.ts'

test('rejects a value that is not an absolute URL before creating a request', () => {
  expect(() => getTextSync('/workspace/lib.d.ts')).toThrow('invalid url')
})

test('requests library text synchronously with the plain-text accept header', () => {
  const open = jest.fn()
  const setRequestHeader = jest.fn()
  const send = jest.fn()
  class MockXmlHttpRequest {
    responseText = 'declare const value: string'
    open = open
    setRequestHeader = setRequestHeader
    send = send
  }
  const original = globalThis.XMLHttpRequest
  globalThis.XMLHttpRequest = MockXmlHttpRequest as unknown as typeof XMLHttpRequest
  try {
    expect(getTextSync('https://example.test/lib.d.ts')).toBe('declare const value: string')
    expect(open).toHaveBeenCalledWith('GET', 'https://example.test/lib.d.ts', false)
    expect(setRequestHeader).toHaveBeenCalledWith('Accept', 'text/plain')
    expect(send).toHaveBeenCalledWith(null)
  } finally {
    globalThis.XMLHttpRequest = original
  }
})
