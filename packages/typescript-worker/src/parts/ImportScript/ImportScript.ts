export const importScript = async (path: string): Promise<any> => {
  try {
    const module = await import(path)
    return module
  } catch (error) {
    throw new Error(`Failed to load ${path}: ${error}`)
  }
}
