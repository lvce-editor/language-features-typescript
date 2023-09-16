import * as ImportScript from '../ImportScript/ImportScript.js'

/**
 *
 * @param {string} path
 * @returns {Promise<import('typescript/lib/tsserverlibrary.js')>}
 */
export const loadTsServerLibrary = async (path) => {
  try {
    const module = await ImportScript.importScript(path)
    if (!module || !module.ts) {
      throw new Error(`no ts export found`)
    }
    return module.ts
  } catch (error) {
    throw new Error(`Failed to load tsserver library: ${error}`)
  }
}
