export const isTypeScriptFile = (path: string): boolean => {
  return path.endsWith('.ts') || path.endsWith('.js')
}
