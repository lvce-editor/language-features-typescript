// @ts-nocheck
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'
import * as Position from '../Position/Position.js'
import { performance } from 'node:perf_hooks'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @returns
 */
const isJavaScriptOrTypeScriptDocument = (textDocument) => {
  return textDocument.languageId === 'javascript' || textDocument.languageId === 'typescript'
}

const getTsTextChanges = (textDocument, edits) => {
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

export const handleWillChangeTextDocument = async (textDocument, edits) => {
  console.log('will change text document')
  if (!isJavaScriptOrTypeScriptDocument(textDocument)) {
    return
  }
  const textChanges = getTsTextChanges(textDocument, edits)
  console.log(
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

const getScriptKind = (textDocument) => {
  if (textDocument.uri.endsWith('.tsx')) {
    return 'TSX'
  }
  if (textDocument.uri.endsWith('.ts')) {
    return 'TS'
  }
  if (textDocument.uri.endsWith('.jsx')) {
    return 'JSX'
  }
  if (textDocument.uri.endsWith('.js')) {
    return 'JS'
  }
  return 'JS'
}

/**
 * @param {vscode.TextDocument} textDocument
 * @returns {import('typescript/lib/protocol').OpenRequestArgs}
 */
const getTsFileToOpen = (textDocument) => {
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
export const handleOpenTextDocuments = async (textDocuments) => {
  const tsDocuments = textDocuments.filter(isJavaScriptOrTypeScriptDocument)
  if (tsDocuments.length === 0) {
    return
  }
  const openFiles = tsDocuments.map(getTsFileToOpen)
  console.log('start-update-open', performance.now())
  await TsServerRequests.updateOpen({
    openFiles,
  })
  console.log('finish-update-open', performance.now())
}

/**
 * @param {vscode.TextDocument} textDocument
 * @returns
 */
export const handleOpenTextDocument = (textDocument) => {
  return handleOpenTextDocuments([textDocument])
}
