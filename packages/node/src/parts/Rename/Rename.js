import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

/**
 * @type {any}
 */
export const rename = async (params) => {
  const tsResult = await TsServerRequests.rename(params)
  return tsResult
}
