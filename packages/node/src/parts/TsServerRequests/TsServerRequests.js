// for reference, see https://github.com/microsoft/TypeScript/blob/cbda2fcce95d7ac82841cee631f07b73be07c0f0/src/server/protocol.ts

import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').BraceCompletionRequest['arguments']} params
 */
export const braceCompletion = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.BraceCompletion, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CloseRequest['arguments']} params
 */
export const close = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Close,
    arguments: params,
  })
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CloseExternalProjectRequest['arguments']} params
 */
export const closeExternalProject = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CloseExternalProject,
    arguments: params,
  })
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CommentSelectionRequest['arguments']} params
 * @returns {Promise<any>}
 */
export const commentSelection = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.CommentSelection, params)
}

/**
 * @param {import('typescript/lib/tsserverlibrary.js').server.protocol. CompletionsRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').CompletionInfo>}
 */
export const completionInfo = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.CompletionInfo, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CompletionDetailsRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').CompletionEntryDetails[]>}
 */
export const completionEntryDetails = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.CompletionEntryDetails, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CompileOnSaveAffectedFileListRequest['arguments']} params
 */
export const compileOnSaveAffectedFileList = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompileOnSaveAffectedFileList,
    arguments: params,
  })
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ConfigureRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').ConfigureResponse>}
 */
export const configure = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Configure, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').DefinitionRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').DefinitionInfo[]>}
 */
export const definition = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Definition, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').DefinitionRequest['arguments']} params
 */
export const definitionAndBoundSpan = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.DefinitionAndBoundSpan,
    arguments: params,
  })
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').DocumentHighlightsRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').DocumentHighlightsResponse>}
 */
export const documentHighlights = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.DocumentHighlights, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').EncodedSemanticClassificationsRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').EncodedSemanticClassificationsResponse['body']>}
 */
export const encodedSemanticClassificationsFull = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.EncodedSemanticClassificationsFull, params)
}

export const exit = () => {}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').FileReferencesRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').FileReferencesResponse>}
 */
export const fileReferences = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.FileReferences, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').FormatRequest['arguments']} params
 */
export const format = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Format, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CodeFixRequest['arguments']} params
 */
export const getCodeFixes = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetCodeFixes, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').GetEditsForFileRenameRequest['arguments']} params
 */
export const getEditsForFileRename = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetEditsForFileRename, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').OutliningSpansRequest['arguments']} params
 */
export const getOutliningSpans = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetOutliningSpans, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').SpanOfEnclosingCommentRequest['arguments']} params
 */
export const getSpanOfEnclosingComment = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetSpanOfEnclosingComment, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').GetSupportedCodeFixesRequest['arguments']} params
 */
export const getSupportedCodeFixes = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetSupportedCodeFixes, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ImplementationRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').ImplementationResponse['body']>}
 */
export const implementation = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Implementation, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').IndentationRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').IndentationResponse>}
 *
 */
export const indentation = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Indentation, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').JsxClosingTagRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').JsxClosingTagResponse['body']|undefined>}
 */
export const jsxClosingTag = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.JsxClosingTag, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').RenameRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').RenameResponseBody>}
 */
export const rename = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Rename, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').OrganizeImportsRequest['arguments']} params
 */
export const organizeImports = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.OrganizeImports, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').PrepareCallHierarchyRequest['arguments']} params
 */
export const prepareCallHierarchy = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.PrepareCallHierarchy, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ProvideCallHierarchyIncomingCallsRequest['arguments']} params
 */
export const provideCallHierarchyIncomingCalls = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ProvideCallHierarchyIncomingCalls, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ProvideCallHierarchyOutgoingCallsRequest['arguments']} params
 */
export const provideCallHierarchyOutgoingCalls = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ProvideCallHierarchyOutgoingCalls, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').InlayHintsRequest['arguments']} params
 */
export const provideInlayHints = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ProvideInlayHints, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').QuickInfoRequest['arguments']} params
 */
export const quickInfo = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Quickinfo, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ReferencesRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').ReferencesResponseBody>}
 */
export const references = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.References, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ReloadRequest['arguments']} params
 */
export const reload = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Reload, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').SemanticDiagnosticsSyncRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').SemanticDiagnosticsSyncResponse>}
 */
export const semanticDiagnosticsSync = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.SemanticDiagnosticsSync, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ToggleLineCommentRequest['arguments']} params
 */
export const toggleLineComment = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ToggleLineComment, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').ToggleMultilineCommentRequest['arguments']} params
 */
export const toggleMultilineComment = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ToggleMultilineComment, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').TypeDefinitionRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').TypeDefinitionResponse['body']>}
 */
export const typeDefinition = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.TypeDefinition, params)
}

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').UpdateOpenRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').Response>}
 */
export const updateOpen = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.UpdateOpen, params)
}
/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').SelectionRangeRequest['arguments']} params
 * @returns {Promise<import('../TsServerProtocol/TsServerProtocol.js').Response>}
 */
export const selectionRange = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.SelectionRange, params)
}

export const openExternalProject = () => {}

/**
 *
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CompletionsRequest['arguments']} params
 */
export const completion = (params) => {}

// TODO need tests for error handling, error handling is pretty bad right now: tsserver stack trace is not shown
