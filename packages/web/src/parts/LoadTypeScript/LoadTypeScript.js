import * as ImportScript from '../ImportScript/ImportScript.js'

/**
 * @param {string} typescriptPath
 */
export const loadTypeScript = async (typescriptPath) => {
  try {
    const module = await ImportScript.importScript(typescriptPath)
    if (!module || !module.ts) {
      throw new Error(`no ts export found`)
    }
    return module.ts
  } catch (error) {
    throw new Error(`Failed to load typescript: ${error}`)
  }
}
