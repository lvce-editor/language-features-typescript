import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const resolveCompletion = async (params) => {
  const tsResult = await TsServerRequests.completionEntryDetails(params)
  return tsResult
}
