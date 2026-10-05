import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const prepareRename = async (typeScriptRpc: CommonRpc, textDocument: any, offset: number): Promise<any> => {
  const { text, uri } = textDocument
  const { fs, languageService } = getOrCreateLanguageService(uri)
  fs.writeFile(uri, text)
  const renameInfo = languageService.getRenameInfo(uri, offset, {})
  if (!renameInfo.canRename) {
    return undefined
  }
  return {
    placeholder: renameInfo.displayName,
    range: renameInfo.triggerSpan,
  }
}
