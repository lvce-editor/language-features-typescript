export const isFullySpecified = (moduleText: string): boolean => {
  switch (moduleText) {
    case '':
    case '.':
    case './':
      return false
    default:
      return true
  }
}
