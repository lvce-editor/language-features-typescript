export const loadTypeScript = async (typescriptPath) => {
  try {
    const module = await import(typescriptPath)
    return module
  } catch (error) {
    throw new Error(`Failed to load typescript: ${error}`)
  }
}
