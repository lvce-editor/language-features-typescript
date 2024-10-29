const opfsRoot = await navigator.storage.getDirectory()
const fileHandle = await opfsRoot.getFileHandle('my-high-speed-file.txt', {
  create: true,
})
const syncAccessHandle = await fileHandle.createSyncAccessHandle()

console.log({ syncAccessHandle })

export { syncAccessHandle }

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
export const read = () => {}
