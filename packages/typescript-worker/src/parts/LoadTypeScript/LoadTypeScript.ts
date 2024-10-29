export const loadTypeScript = async (typescriptUrl: string): Promise<typeof import('typescript')> => {
  try {
    // @ts-ignore
    globalThis.module = {
      exports: {},
    }
    await import(typescriptUrl)
    const ts = /**  @type {import('typescript')} */ globalThis.module.exports
    delete globalThis.module.exports
    return ts
  } catch (error) {
    throw new Error(`Failed to launch typescript: ${error}`)
  }
}
