import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

/**
 * @type {any}
 */
export const getHover = async (params) => {
  const tsResult = await TsServerRequests.quickInfo(params)
  return tsResult
}
