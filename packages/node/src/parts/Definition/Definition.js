import * as TextDocuments from '../TextDocuments/TextDocuments.js'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const getDefinition = async (uri, tsPosition) => {
  if (!TextDocuments.hasUri(uri)) {
    throw new Error(`Text document must be opened before requesting completion`)
  }
  const tsResult = await TsServerRequests.definition({
    file: uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  console.log({ tsResult, uri, tsPosition })
  return tsResult
}
