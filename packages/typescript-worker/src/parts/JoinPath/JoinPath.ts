// TODO handle relative parts like ../ or ./
export const joinPath = (...parts: readonly string[]): string => {
  const resolvedParts: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('./')) {
      resolvedParts.push(part.slice(2))
    } else {
      resolvedParts.push(part)
    }
  }
  return resolvedParts.join('/')
}
