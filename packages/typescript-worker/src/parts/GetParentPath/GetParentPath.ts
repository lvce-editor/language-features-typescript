export const getParentPath = (uri: string): string => {
  const slashIndex = uri.lastIndexOf('/')
  if (slashIndex === -1) {
    return ''
  }
  return uri.slice(0, slashIndex)
}
