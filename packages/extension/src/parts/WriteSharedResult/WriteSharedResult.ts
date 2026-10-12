export interface SharedSetup {
  readonly maxDelay: number
  readonly shared: SharedArrayBuffer
  readonly textAccessHandle?: FileSystemSyncAccessHandle
}

const sendChunk = async (setup: SharedSetup, bytes: Uint8Array, chunk: Uint8Array, state: number): Promise<boolean> => {
  const header = new Int32Array(setup.shared, 0, 2)
  if (Atomics.load(header, 0) === 3) {
    return false
  }
  bytes.set(chunk)
  Atomics.store(header, 1, chunk.length)
  Atomics.store(header, 0, state)
  Atomics.notify(header, 0)
  if (state !== 1) {
    return true
  }
  const acknowledged = await Atomics.waitAsync(header, 0, 1, setup.maxDelay).value
  return acknowledged !== 'timed-out'
}

const writeSharedText = async (setup: SharedSetup, content: string): Promise<void> => {
  const bytes = new Uint8Array(setup.shared, 8)
  const marker = new TextEncoder().encode(JSON.stringify({ __textTransfer: 'shared' }))
  if (!(await sendChunk(setup, bytes, marker, 1))) {
    return
  }
  const encoded = new TextEncoder().encode(content)
  if (encoded.length === 0) {
    await sendChunk(setup, bytes, encoded, 2)
    return
  }
  for (let offset = 0; offset < encoded.length; offset += bytes.length) {
    const chunk = encoded.subarray(offset, offset + bytes.length)
    const state = offset + chunk.length === encoded.length ? 2 : 1
    if (!(await sendChunk(setup, bytes, chunk, state))) {
      return
    }
  }
}

export const writeSharedResult = async (
  setup: SharedSetup,
  result: unknown,
  error: any,
  isText: boolean,
): Promise<void> => {
  const header = new Int32Array(setup.shared, 0, 2)
  const bytes = new Uint8Array(setup.shared, 8)
  if (isText && !error && !setup.textAccessHandle) {
    await writeSharedText(setup, result as string)
    return
  }
  const response = error
    ? { error: { message: String(error.message ?? error) } }
    : isText
      ? { __textTransfer: 'opfs' }
      : { result }
  if (isText && !error && setup.textAccessHandle) {
    const encodedText = new TextEncoder().encode(result as string)
    setup.textAccessHandle.truncate(encodedText.length)
    setup.textAccessHandle.write(encodedText, { at: 0 })
    setup.textAccessHandle.flush()
  }
  const encoded = new TextEncoder().encode(JSON.stringify(response))
  for (let offset = 0; offset < encoded.length; offset += bytes.length) {
    const chunk = encoded.subarray(offset, offset + bytes.length)
    const state = offset + chunk.length === encoded.length ? 2 : 1
    if (!(await sendChunk(setup, bytes, chunk, state))) {
      return
    }
  }
}
