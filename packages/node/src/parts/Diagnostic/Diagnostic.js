import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const getDiagnostic = async (params) => {
  const tsResult = await TsServerRequests.semanticDiagnosticsSync(params)
  return tsResult
}
