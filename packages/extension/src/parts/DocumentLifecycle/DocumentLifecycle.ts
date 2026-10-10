import { executeCommand } from '@lvce-editor/api'

export const getOpenUris = async (): Promise<readonly string[]> => {
  const uris = await executeCommand('GetActiveEditor.getOpenEditorUris')
  if (!Array.isArray(uris) || uris.some((uri) => typeof uri !== 'string')) {
    throw new Error('Invalid open document snapshot')
  }
  return uris
}
