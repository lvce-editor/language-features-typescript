import { cp } from 'node:fs/promises'
import { join } from 'node:path'

export const copyExtensionSchemas = async (extensionPath: string, distPath: string): Promise<void> => {
  await cp(join(extensionPath, 'schemas'), join(distPath, 'schemas'), {
    recursive: true,
  })
}
