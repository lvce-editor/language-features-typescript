export interface DocumentSymbol {
  readonly children?: readonly DocumentSymbol[]
  readonly detail?: string
  readonly endOffset: number
  readonly kind: string
  readonly name: string
  readonly selectionEndOffset: number
  readonly selectionStartOffset: number
  readonly startOffset: number
}
