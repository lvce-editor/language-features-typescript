import { afterEach, expect, jest, test } from '@jest/globals'
import { supportsConcurrentFileHandles } from '../src/parts/SupportsConcurrentFileHandles/SupportsConcurrentFileHandles.ts'

const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
afterEach(() => {
  if (original) Object.defineProperty(globalThis, 'navigator', original)
  else Reflect.deleteProperty(globalThis, 'navigator')
})

test.each([true, false])(
  'probes actual concurrent handles and releases the probe when supported=%s',
  async (supported) => {
    const first = { close: jest.fn() }
    const second = { close: jest.fn() }
    let calls = 0
    const file = {
      createSyncAccessHandle: jest.fn(async (_options: { mode: string }) => {
        if (++calls === 1) return first
        if (!supported) throw new DOMException('No modification allowed', 'NoModificationAllowedError')
        return second
      }),
    }
    const root = { getFileHandle: jest.fn(async () => file), removeEntry: jest.fn(async (_name: string) => {}) }
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { storage: { getDirectory: async () => root } },
    })
    await expect(supportsConcurrentFileHandles()).resolves.toBe(supported)
    expect(first.close).toHaveBeenCalledTimes(1)
    expect(second.close).toHaveBeenCalledTimes(supported ? 1 : 0)
    expect(root.removeEntry).toHaveBeenCalledWith(expect.stringMatching(/^typescript-transport-probe-/))
    expect(file.createSyncAccessHandle).toHaveBeenCalledWith({ mode: 'readwrite-unsafe' })
  },
)

test('handles unavailable OPFS and unavailable synchronous access without leaking a probe', async () => {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} })
  await expect(supportsConcurrentFileHandles()).resolves.toBe(false)
  const removeEntry = jest.fn(async () => {
    throw new Error('already removed')
  })
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      storage: {
        getDirectory: async () => ({
          getFileHandle: async () => ({}),
          removeEntry,
        }),
      },
    },
  })
  await expect(supportsConcurrentFileHandles()).resolves.toBe(false)
  expect(removeEntry).toHaveBeenCalledTimes(1)
})
