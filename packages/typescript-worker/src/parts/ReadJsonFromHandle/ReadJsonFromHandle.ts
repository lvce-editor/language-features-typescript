export const readJsonFromHandle = (handle: FileSystemSyncAccessHandle, size: number): any => {
  const buf = new Uint8Array(size)
  handle.read(buf)
  const text = new TextDecoder().decode(buf)
  const parsed = JSON.parse(text)
  return parsed
}
