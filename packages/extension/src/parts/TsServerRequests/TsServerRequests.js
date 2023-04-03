// for reference, see https://github.com/Microsoft/TypeScript/blob/main/lib/protocol.d.ts#L5

import * as Id from '../Id/Id.js'
import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {import('typescript/lib/protocol').BraceCompletionRequest['arguments']} params
 */
export const braceCompletion = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.BraceCompletion,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.BraceCompletion)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ChangeRequest['arguments']} params
 */
export const change = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Change,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').CloseRequest['arguments']} params
 */
export const close = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Close,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').CloseExternalProjectRequest['arguments']} params
 */
export const closeExternalProject = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CloseExternalProject,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').CommentSelectionRequest['arguments']} params
 * @returns {Promise<any>}
 */
export const commentSelection = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CommentSelection,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.CommentSelection)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').CompletionDetailsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionDetailsResponse>}
 */
export const completionDetails = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompletionEntryDetails,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.CompletionEntryDetails)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').CompletionsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionInfo>}
 */
export const completionInfo = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompletionInfo,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.CompletionInfo)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').CompileOnSaveAffectedFileListRequest['arguments']} params
 */
export const compileOnSaveAffectedFileList = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompileOnSaveAffectedFileList,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ConfigureRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ConfigureResponse>}
 */
export const configure = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Configure,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Configure)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DefinitionInfo[]>}
 */
export const definition = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Definition,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Definition)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 */
export const definitionAndBoundSpan = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: 'definitionAndBoundSpan',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').DocumentHighlightsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DocumentHighlightsResponse>}
 */
export const documentHighlights = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
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
 * @param {import('typescript/lib/protocol').EncodedSemanticClassificationsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').EncodedSemanticClassificationsResponse['body']>}
 */
export const encodedSemanticClassificationsFull = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: 'encodedSemanticClassifications-full',
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, 'encodedSemanticClassificationsFull')
  }
  return message.body
}

export const exit = () => {}

/**
 * @param {import('typescript/lib/protocol').FileReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').FileReferencesResponse>}
 */
export const fileReferences = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
    command: 'format',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').CodeFixRequest['arguments']} params
 */
export const getCodeFixes = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: 'getCodeFixes',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').GetEditsForFileRenameRequest['arguments']} params
 */
export const getEditsForFileRename = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: 'getEditsForFileRename',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').OutliningSpansRequest['arguments']} params
 */
export const getOutliningSpans = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: 'getOutliningSpans',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').SpanOfEnclosingCommentRequest['arguments']} params
 */
export const getSpanOfEnclosingComment = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: 'getSpanOfEnclosingComment',
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').GetSupportedCodeFixesRequest['arguments']} params
 */
export const getSupportedCodeFixes = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
    command: TsServerCommandType.OrganizeImports,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.OrganizeImports)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').PrepareCallHierarchyRequest['arguments']} params
 */
export const prepareCallHierarchy = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.PrepareCallHierarchy,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyIncomingCallsRequest['arguments']} params
 */
export const provideCallHierarchyIncomingCalls = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideCallHierarchyIncomingCalls,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyOutgoingCallsRequest['arguments']} params
 */
export const provideCallHierarchyOutgoingCalls = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideCallHierarchyOutgoingCalls,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').InlayHintsRequest['arguments']} params
 */
export const provideInlayHints = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideInlayHints,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').ReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ReferencesResponseBody>}
 */
export const references = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.References,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.References)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ReloadRequest['arguments']} params
 */
export const reload = async (params) => {
  await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Reload,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').SemanticDiagnosticsSyncRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').SemanticDiagnosticsSyncResponse>}
 */
export const semanticDiagnosticsSync = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.SemanticDiagnosticsSync,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(
      message,
      TsServerCommandType.SemanticDiagnosticsSync
    )
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ToggleLineCommentRequest['arguments']} params
 */
export const toggleLineComment = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ToggleLineComment,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.ToggleLineComment)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').ToggleMultilineCommentRequest['arguments']} params
 */
export const toggleMultilineComment = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ToggleMultilineComment,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.ToggleMultilineComment)
  }
  return message.body
}

/**
 * @param {import('typescript/lib/protocol').TypeDefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').TypeDefinitionResponse['body']>}
 */
export const typeDefinition = async (params) => {
  const message = await TsPrimaryServer.invoke({
    type: TsServerMessageType.Request,
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
    type: TsServerMessageType.Request,
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
