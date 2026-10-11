import { getPreference, readFile } from '@lvce-editor/api'

export const state = { getPreference, readFile }

interface VerifiedDocument {
  configHash: string
  configUri: string
  hash: string
  uri: string
}

const hashText = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Exporters may supply diagnostics already verified for a fixed document/config.
// Changes, unavailable evidence, and language feature requests retain normal checking.
export const isVerified = async (document: { uri: string; text: string }): Promise<boolean> => {
  try {
    const verified: unknown = await state.getPreference('typescript.verifiedDiagnostics')
    if (!Array.isArray(verified)) return false
    const entry: VerifiedDocument | undefined = verified.find(
      (entry) =>
        entry?.uri === document.uri &&
        typeof entry.hash === 'string' &&
        typeof entry.configUri === 'string' &&
        typeof entry.configHash === 'string',
    )
    if (!entry || (await hashText(document.text)) !== entry.hash) return false
    const config = await state.readFile(entry.configUri)
    return typeof config === 'string' && (await hashText(config)) === entry.configHash
  } catch {
    return false
  }
}
