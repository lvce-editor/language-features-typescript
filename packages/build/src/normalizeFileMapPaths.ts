export const normalizeFileMapPaths = (fileMap: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(fileMap).map(([path, content]) => [path.replaceAll('\\', '/'), content]))
