// for reference, see https://github.com/microsoft/TypeScript/blob/cbda2fcce95d7ac82841cee631f07b73be07c0f0/src/server/protocol.ts

import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {import('typescript/lib/protocol').BraceCompletionRequest['arguments']} params
 */
export const braceCompletion = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.BraceCompletion, params)
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
export const commentSelection = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.CommentSelection, params)
}

/**
 * @param {import('typescript/lib/protocol').CompletionsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionInfo>}
 */
export const completionInfo = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.CompletionInfo, params)
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
export const configure = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Configure, params)
}

/**
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DefinitionInfo[]>}
 */
export const definition = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Definition, params)
}

/**
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 */
export const definitionAndBoundSpan = (params) => {
  TsPrimaryServer.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.DefinitionAndBoundSpan,
    arguments: params,
  })
}

/**
 * @param {import('typescript/lib/protocol').DocumentHighlightsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DocumentHighlightsResponse>}
 */
export const documentHighlights = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.DocumentHighlights, params)
}

/**
 * @param {import('typescript/lib/protocol').EncodedSemanticClassificationsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').EncodedSemanticClassificationsResponse['body']>}
 */
export const encodedSemanticClassificationsFull = async (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.EncodedSemanticClassificationsFull,
    params
  )
}

export const exit = () => {}

/**
 * @param {import('typescript/lib/protocol').FileReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').FileReferencesResponse>}
 */
export const fileReferences = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.FileReferences, params)
}

/**
 * @param {import('typescript/lib/protocol').FormatRequest['arguments']} params
 */
export const format = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Format, params)
}

/**
 * @param {import('typescript/lib/protocol').CodeFixRequest['arguments']} params
 */
export const getCodeFixes = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetCodeFixes, params)
}

/**
 * @param {import('typescript/lib/protocol').GetEditsForFileRenameRequest['arguments']} params
 */
export const getEditsForFileRename = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.GetEditsForFileRename,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').OutliningSpansRequest['arguments']} params
 */
export const getOutliningSpans = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.GetOutliningSpans, params)
}

/**
 * @param {import('typescript/lib/protocol').SpanOfEnclosingCommentRequest['arguments']} params
 */
export const getSpanOfEnclosingComment = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.GetSpanOfEnclosingComment,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').GetSupportedCodeFixesRequest['arguments']} params
 */
export const getSupportedCodeFixes = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.GetSupportedCodeFixes,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').ImplementationRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ImplementationResponse['body']>}
 */
export const implementation = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Implementation, params)
}

/**
 * @param {import('typescript/lib/protocol').IndentationRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').IndentationResponse>}
 *
 */
export const indentation = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Indentation, params)
}

/**
 * @param {import('typescript/lib/protocol').JsxClosingTagRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').JsxClosingTagResponse['body']|undefined>}
 */
export const jsxClosingTag = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.JsxClosingTag, params)
}

/**
 * @param {import('typescript/lib/protocol').RenameRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').RenameResponseBody>}
 */
export const rename = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Rename, params)
}

/**
 * @param {import('typescript/lib/protocol').OrganizeImportsRequest['arguments']} params
 */
export const organizeImports = async (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.OrganizeImports, params)
}

/**
 * @param {import('typescript/lib/protocol').PrepareCallHierarchyRequest['arguments']} params
 */
export const prepareCallHierarchy = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.PrepareCallHierarchy,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyIncomingCallsRequest['arguments']} params
 */
export const provideCallHierarchyIncomingCalls = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.ProvideCallHierarchyIncomingCalls,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyOutgoingCallsRequest['arguments']} params
 */
export const provideCallHierarchyOutgoingCalls = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.ProvideCallHierarchyOutgoingCalls,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').InlayHintsRequest['arguments']} params
 */
export const provideInlayHints = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ProvideInlayHints, params)
}

/**
 * @param {import('typescript/lib/protocol').QuickInfoRequest['arguments']} params
 */
export const quickInfo = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Quickinfo, params)
}

/**
 * @param {import('typescript/lib/protocol').ReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ReferencesResponseBody>}
 */
export const references = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.References, params)
}

/**
 * @param {import('typescript/lib/protocol').ReloadRequest['arguments']} params
 */
export const reload = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.Reload, params)
}

/**
 * @param {import('typescript/lib/protocol').SemanticDiagnosticsSyncRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').SemanticDiagnosticsSyncResponse>}
 */
export const semanticDiagnosticsSync = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.SemanticDiagnosticsSync,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').ToggleLineCommentRequest['arguments']} params
 */
export const toggleLineComment = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.ToggleLineComment, params)
}

/**
 * @param {import('typescript/lib/protocol').ToggleMultilineCommentRequest['arguments']} params
 */
export const toggleMultilineComment = (params) => {
  return TsPrimaryServer.invoke(
    TsServerCommandType.ToggleMultilineComment,
    params
  )
}

/**
 * @param {import('typescript/lib/protocol').TypeDefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').TypeDefinitionResponse['body']>}
 */
export const typeDefinition = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.TypeDefinition, params)
}

/**
 * @param {import('typescript/lib/protocol').UpdateOpenRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').Response>}
 */
export const updateOpen = (params) => {
  return TsPrimaryServer.invoke(TsServerCommandType.UpdateOpen, params)
}

export const openExternalProject = () => {}

/**
 *
 * @param {import('typescript/lib/protocol').CompletionsRequest['arguments']} params
 */
export const completion = (params) => {}

// TODO need tests for error handling, error handling is pretty bad right now: tsserver stack trace is not shown
