export const loadTypeScript = async (typescriptUrl: string) => {
  try {
    const module = await import(typescriptUrl)
    return module
  } catch (error) {
    throw new Error(`Failed to launch typescript: ${error}`)
  }
}
