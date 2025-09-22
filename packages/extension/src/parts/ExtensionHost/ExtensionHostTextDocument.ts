// @ts-nocheck
import { performance } from 'node:perf_hooks'
import * as Position from '../Position/Position.ts'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.ts'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @returns
 */
const isJavaScriptOrTypeScriptDocument = (textDocument: any): boolean => {
  return textDocument.languageId === 'javascript' || textDocument.languageId === 'typescript'
}

const getTsTextChanges = (textDocument: any, edits: any[]): any[] => {
  const tsChanges = []
  for (const edit of edits) {
    tsChanges.push({
      start: Position.getTsPosition(textDocument, edit.startOffset),
      end: Position.getTsPosition(textDocument, edit.endOffset),
      newText: edit.inserted,
    })
  }
  return tsChanges
}

export const handleWillChangeTextDocument = async (textDocument: any, edits: any[]): Promise<void> => {
  console.warn('will change text document')
  if (!isJavaScriptOrTypeScriptDocument(textDocument)) {
    return
  }
  const textChanges = getTsTextChanges(textDocument, edits)
  console.warn(
    JSON.stringify({
      changedFiles: [
        {
          fileName: textDocument.uri,
          textChanges,
        },
      ],
    }),
  )
  await TsServerRequests.updateOpen({
    changedFiles: [
      {
        fileName: textDocument.uri,
        textChanges,
      },
    ],
  })
}

const getScriptKind = (textDocument: any): string => {
  if (textDocument.uri.endsWith('.tsx')) {
    return 'TSX'
  }
  if (textDocument.uri.endsWith('.ts')) {
    return 'TS'
  }
  if (textDocument.uri.endsWith('.jsx')) {
    return 'JSX'
  }
  if (textDocument.uri.endsWith('.ts')) {
    return 'JS'
  }
  return 'JS'
}

/**
 * @param {vscode.TextDocument} textDocument
 * @returns {import('typescript/lib/protocol').OpenRequestArgs}
 */
const getTsFileToOpen = (textDocument: any): any => {
  return {
    file: textDocument.uri,
    fileContent: vscode.getTextFromTextDocument(textDocument),
    scriptKindName: getScriptKind(textDocument),
  }
}

/**
 * @param {readonly vscode.TextDocument[]} textDocuments
 * @returns
 */
export const handleOpenTextDocuments = async (textDocuments: any[]): Promise<void> => {
  const tsDocuments = textDocuments.filter(isJavaScriptOrTypeScriptDocument)
  if (tsDocuments.length === 0) {
    return
  }
  const openFiles = tsDocuments.map(getTsFileToOpen)
  console.warn('start-update-open', performance.now())
  await TsServerRequests.updateOpen({
    openFiles,
  })
  console.warn('finish-update-open', performance.now())
}

/**
 * @param {vscode.TextDocument} textDocument
 * @returns
 */
export const handleOpenTextDocument = (textDocument: any): Promise<void> => {
  return handleOpenTextDocuments([textDocument])
}
