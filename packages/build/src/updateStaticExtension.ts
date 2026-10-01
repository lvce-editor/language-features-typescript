interface ExtensionManifest {
  id: string
  rpc?: unknown[]
}

interface StaticExtension {
  id: string
  rpc?: unknown[]
  [key: string]: unknown
}

export const updateStaticExtension = (
  extensions: StaticExtension[],
  extensionManifest: ExtensionManifest,
): StaticExtension[] => {
  let found = false
  const updatedExtensions = extensions.map((extension) => {
    if (extension.id !== extensionManifest.id) {
      return extension
    }
    found = true
    return {
      ...extension,
      rpc: extensionManifest.rpc,
    }
  })
  if (!found) {
    throw new Error(`Static extension not found: ${extensionManifest.id}`)
  }
  return updatedExtensions
}
