// for reference, see https://github.com/Microsoft/TypeScript/blob/main/lib/protocol.d.ts#L5

import VError from 'verror'
import * as Id from '../Id/Id.js'

// TODO somehow tsserver stack is not printed
class TsServerError extends VError {
  // @ts-ignore
  constructor(message, command) {
    // console.log({ message })
    const actualMessage = message.message || ''
    const lines = actualMessage.split('\n')
    if (lines.length === 1) {
      super(`TsServer.${command} failed to execute: ${actualMessage}`)
      return
    }
    const [shortDescription, actualError, ...stack] = lines
    let betterActualError = actualError
    if (betterActualError.startsWith('Error: ')) {
      betterActualError = betterActualError.slice(7)
    }
    let betterShortDescription = `TsServer.${command} failed to execute`
    const tsError = new Error(betterActualError)
    tsError.stack = [shortDescription, actualError, ...stack].join('\n')
    // @ts-ignore
    super(tsError, betterShortDescription)
  }
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').BraceCompletionRequest['arguments']} params
 */
export const braceCompletion = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'braceCompletion',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'braceCompletion')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ChangeRequest['arguments']} params
 */
export const change = (server, params) => {
  server.send({
    type: 'request',
    command: 'change',
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CloseRequest['arguments']} params
 */
export const close = (server, params) => {
  server.send({
    type: 'request',
    command: 'close',
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CloseExternalProjectRequest['arguments']} params
 */
export const closeExternalProject = (server, params) => {
  server.send({
    type: 'request',
    command: 'closeExternalProject',
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CommentSelectionRequest['arguments']} params
 * @returns {Promise<any>}
 */
export const commentSelection = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'commentSelection',
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, 'commentSelection')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompletionDetailsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionDetailsResponse>}
 */
export const completionDetails = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'completionEntryDetails',
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, 'completionEntryDetails')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompletionsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionInfo>}
 */
export const completionInfo = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'completionInfo',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'completionInfo')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompileOnSaveAffectedFileListRequest['arguments']} params
 */
export const compileOnSaveAffectedFileList = (server, params) => {
  server.send({
    type: 'request',
    command: 'compileOnSaveAffectedFileList',
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ConfigureRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ConfigureResponse>}
 */
export const configure = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'configure',
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, 'configure')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DefinitionInfo[]>}
 */
export const definition = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'definition',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'definition')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 */
export const definitionAndBoundSpan = (server, params) => {
  server.send({
    type: 'request',
    command: 'definitionAndBoundSpan',
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').DocumentHighlightsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DocumentHighlightsResponse>}
 */
export const documentHighlights = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'documentHighlights',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'documentHighlights')
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').EncodedSemanticClassificationsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').EncodedSemanticClassificationsResponse['body']>}
 */
export const encodedSemanticClassificationsFull = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'encodedSemanticClassifications-full',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'encodedSemanticClassificationsFull')
  }
  return message.body
}

/**
 * @param {any} server
 */
export const exit = async (server) => {
  await server.invoke({
    type: 'request',
    command: 'exit',
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').FileReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').FileReferencesResponse>}
 */
export const fileReferences = async (server, params) => {
  const message = await server.invoke({
    type: 'request',
    command: 'fileReferences',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'fileReferences')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').FormatRequest['arguments']} params
 */
export const format = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'format',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').CodeFixRequest['arguments']} params
 */
export const getCodeFixes = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'getCodeFixes',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').GetEditsForFileRenameRequest['arguments']} params
 */
export const getEditsForFileRename = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'getEditsForFileRename',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').OutliningSpansRequest['arguments']} params
 */
export const getOutliningSpans = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'getOutliningSpans',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').SpanOfEnclosingCommentRequest['arguments']} params
 */
export const getSpanOfEnclosingComment = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'getSpanOfEnclosingComment',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').GetSupportedCodeFixesRequest['arguments']} params
 */
export const getSupportedCodeFixes = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'getSupportedCodeFixes',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ImplementationRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ImplementationResponse['body']>}
 */
export const implementation = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'implementation',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'implementation')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').IndentationRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').IndentationResponse>}
 *
 */
export const indentation = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'indentation',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'indentation')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').JsxClosingTagRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').JsxClosingTagResponse['body']|undefined>}
 */
export const jsxClosingTag = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'jsxClosingTag',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    if (message.message === 'No content available.') {
      return undefined
    }
    throw new TsServerError(message, 'jsxClosingTag')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').RenameRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').RenameResponseBody>}
 */
export const rename = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'rename',
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, 'rename')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').OrganizeImportsRequest['arguments']} params
 */
export const organizeImports = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'organizeImports',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'organizeImports')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').PrepareCallHierarchyRequest['arguments']} params
 */
export const prepareCallHierarchy = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'prepareCallHierarchy',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyIncomingCallsRequest['arguments']} params
 */
export const provideCallHierarchyIncomingCalls = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'provideCallHierarchyIncomingCalls',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyOutgoingCallsRequest['arguments']} params
 */
export const provideCallHierarchyOutgoingCalls = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'provideCallHierarchyOutgoingCalls',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').InlayHintsRequest['arguments']} params
 */
export const provideInlayHints = (params) => {
  TsPrimaryServer.send({
    type: 'request',
    command: 'provideInlayHints',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ReferencesResponseBody>}
 */
export const references = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'references',
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, 'references')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ReloadRequest['arguments']} params
 */
export const reload = async (params) => {
  await TsPrimaryServer.invoke({
    type: 'request',
    command: 'reload',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').SemanticDiagnosticsSyncRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').SemanticDiagnosticsSyncResponse>}
 */
export const semanticDiagnosticsSync = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'semanticDiagnosticsSync',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'semanticDiagnosticsSync')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ToggleLineCommentRequest['arguments']} params
 */
export const toggleLineComment = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'toggleLineComment',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'toggleLineComment')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ToggleMultilineCommentRequest['arguments']} params
 */
export const toggleMultilineComment = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'toggleMultilineComment',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'toggleMultiLineComment')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').TypeDefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').TypeDefinitionResponse['body']>}
 */
export const typeDefinition = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'typeDefinition',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'typeDefinition')
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').UpdateOpenRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').Response>}
 */
export const updateOpen = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: 'request',
    command: 'updateOpen',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'updateOpen')
  }
  return message.body
}

export const openExternalProject = () => {}

/**
 *
 * @param {import('typescript/lib/protocol').CompletionsRequest['arguments']} params
 */
export const completion = (params) => {}

// TODO need tests for error handling, error handling is pretty bad right now: tsserver stack trace is not shown
