import { readFile, writeFile } from 'node:fs/promises'
import type { TypeScriptLibManifest } from './getTypeScriptLibManifest.ts'

const manifestPlaceholder = "'__TYPE_SCRIPT_LIB_MANIFEST__'"

export const replaceTypeScriptLibManifest = async (
  workerBundlePath: string,
  manifest: TypeScriptLibManifest,
): Promise<void> => {
  const workerBundle = await readFile(workerBundlePath, 'utf8')
  if (!workerBundle.includes(manifestPlaceholder)) {
    return
  }
  await writeFile(workerBundlePath, workerBundle.replace(manifestPlaceholder, JSON.stringify(JSON.stringify(manifest))))
}
