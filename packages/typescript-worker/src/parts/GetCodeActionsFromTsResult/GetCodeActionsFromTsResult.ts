interface Edit {
  readonly endOffset: number
  readonly inserted: string
  readonly startOffset: number
}

interface TextSpan {
  readonly length: number
  readonly start: number
}

interface TextChange {
  readonly newText: string
  readonly span: TextSpan
}

interface FileTextChanges {
  readonly fileName: string
  readonly textChanges: readonly TextChange[]
}

export interface CodeFixAction {
  readonly changes: readonly FileTextChanges[]
  readonly description: string
}

interface CodeAction {
  readonly edits: readonly Edit[]
  readonly kind: 'quickfix'
  readonly name: string
}

const getEdits = (uri: string, changes: readonly FileTextChanges[]): readonly Edit[] => {
  const edits: Edit[] = []
  for (const change of changes) {
    if (change.fileName !== uri) {
      continue
    }
    for (const textChange of change.textChanges) {
      edits.push({
        endOffset: textChange.span.start + textChange.span.length,
        inserted: textChange.newText,
        startOffset: textChange.span.start,
      })
    }
  }
  return edits
}

export const getCodeActionsFromTsResult = (uri: string, fixes: readonly CodeFixAction[]): readonly CodeAction[] => {
  const actions: CodeAction[] = []
  for (const fix of fixes) {
    const edits = getEdits(uri, fix.changes)
    if (edits.length === 0) {
      continue
    }
    actions.push({
      edits,
      kind: 'quickfix',
      name: fix.description,
    })
  }
  return actions
}
