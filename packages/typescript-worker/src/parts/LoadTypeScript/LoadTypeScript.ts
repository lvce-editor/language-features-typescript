import * as ImportScript from '../ImportScript/ImportScript.ts'

export const loadTypeScript = async (typescriptPath: string): Promise<typeof import('typescript')> => {
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
