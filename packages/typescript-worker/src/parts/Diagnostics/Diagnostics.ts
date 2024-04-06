import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'

export const getDiagnostics = (textDocument): readonly Diagnostic[] => {
  console.log({ textDocument })
  return [
    {
      uri: textDocument.uri,
      rowIndex: 0,
      columnIndex: 0,
      message: 'test error 1',
    },
  ]
}
