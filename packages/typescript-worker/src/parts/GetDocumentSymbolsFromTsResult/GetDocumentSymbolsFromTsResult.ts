import type { DocumentSymbol } from '../DocumentSymbol/DocumentSymbol.ts'

interface TextSpan {
  readonly length: number
  readonly start: number
}

interface NavigationItem {
  readonly childItems?: readonly NavigationItem[]
  readonly kind: string
  readonly nameSpan?: TextSpan
  readonly spans: readonly TextSpan[]
  readonly text: string
}

const convertItem = (item: NavigationItem): DocumentSymbol | undefined => {
  const range = item.spans[0]
  if (!range) {
    return undefined
  }
  const selectionRange = item.nameSpan || range
  const children = (item.childItems || []).flatMap((child) => {
    const converted = convertItem(child)
    return converted ? [converted] : []
  })
  return {
    ...(children.length > 0 && { children }),
    endOffset: range.start + range.length,
    kind: item.kind,
    name: item.text,
    selectionEndOffset: selectionRange.start + selectionRange.length,
    selectionStartOffset: selectionRange.start,
    startOffset: range.start,
  }
}

export const getDocumentSymbolsFromTsResult = (tree: NavigationItem): readonly DocumentSymbol[] => {
  return (tree.childItems || []).flatMap((item) => {
    const converted = convertItem(item)
    return converted ? [converted] : []
  })
}
