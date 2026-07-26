export interface Diagnostic {
  readonly columnIndex: number
  readonly message: string
  readonly rowIndex: number
  readonly uri: string
}
