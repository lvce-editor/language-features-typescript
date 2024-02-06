import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const expandSelection = async (params) => {
  console.log({ params: params.locations })
  const tsResult = await TsServerRequests.selectionRange(params)
  return tsResult
}
