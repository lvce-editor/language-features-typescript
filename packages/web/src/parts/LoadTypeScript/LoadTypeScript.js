export const loadTypeScript = async (typescriptPath) => {
  try {
    const module = await import(typescriptPath)
    if (!module || !module.ts) {
      throw new Error(`no ts export found`)
    }
    return module.ts
  } catch (error) {
    throw new Error(`Failed to load typescript: ${error}`)
  }
}
