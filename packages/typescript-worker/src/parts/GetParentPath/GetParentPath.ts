export const getParentPath = (uri: string): string => {
  const slashIndex = uri.lastIndexOf('/')
  if (slashIndex === -1) {
    return ''
  }
  if (uri[slashIndex - 1] === '/') {
    return ''
  }
  return uri.slice(0, slashIndex)
}
