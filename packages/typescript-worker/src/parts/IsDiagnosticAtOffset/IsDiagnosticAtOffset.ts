interface Diagnostic {
  readonly length: number | undefined
  readonly start: number | undefined
}

export const isDiagnosticAtOffset = (diagnostic: Diagnostic, offset: number): boolean => {
  if (diagnostic.start === undefined || diagnostic.length === undefined) {
    return false
  }
  return diagnostic.start <= offset && offset <= diagnostic.start + diagnostic.length
}
