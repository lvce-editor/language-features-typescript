export interface Diagnostic {
  readonly uri: string
  readonly rowIndex: number
  readonly columnIndex: number
  readonly message: string
}
