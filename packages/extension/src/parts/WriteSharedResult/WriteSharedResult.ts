export interface SharedSetup {
  readonly maxDelay: number
  readonly shared: SharedArrayBuffer
  readonly textAccessHandle: FileSystemSyncAccessHandle
}

export const writeSharedResult = async (
  setup: SharedSetup,
  result: unknown,
  error: any,
  isText: boolean,
): Promise<void> => {
  const header = new Int32Array(setup.shared, 0, 2)
  const bytes = new Uint8Array(setup.shared, 8)
  const response = error ? { error: { message: String(error.message ?? error) } } : isText ? { text: true } : { result }
  if (isText && !error) {
    const encodedText = new TextEncoder().encode(result as string)
    setup.textAccessHandle.truncate(encodedText.length)
    setup.textAccessHandle.write(encodedText, { at: 0 })
    setup.textAccessHandle.flush()
  }
  const encoded = new TextEncoder().encode(JSON.stringify(response))
  for (let offset = 0; offset < encoded.length; offset += bytes.length) {
    if (Atomics.load(header, 0) === 3) {
      return
    }
    const chunk = encoded.subarray(offset, offset + bytes.length)
    bytes.set(chunk)
    Atomics.store(header, 1, chunk.length)
    const state = offset + chunk.length === encoded.length ? 2 : 1
    Atomics.store(header, 0, state)
    Atomics.notify(header, 0)
    if (state === 1) {
      // Do not block the extension host while the TypeScript worker consumes a chunk.
      const acknowledged = await Atomics.waitAsync(header, 0, 1, setup.maxDelay).value
      if (acknowledged === 'timed-out') {
        return
      }
    }
  }
}
