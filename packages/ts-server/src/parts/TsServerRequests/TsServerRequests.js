// for reference, see https://github.com/Microsoft/TypeScript/blob/main/lib/protocol.d.ts#L5

import VError from 'verror'
import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'

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
    type: TsServerMessageType.Request,
    command: TsServerCommandType.BraceCompletion,
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
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Change,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CloseRequest['arguments']} params
 */
export const close = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Close,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CloseExternalProjectRequest['arguments']} params
 */
export const closeExternalProject = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CloseExternalProject,
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompletionDetailsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionDetailsResponse>}
 */
export const completionDetails = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompletionsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionInfo>}
 */
export const completionInfo = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompileOnSaveAffectedFileListRequest['arguments']} params
 */
export const compileOnSaveAffectedFileList = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompileOnSaveAffectedFileList,
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').DefinitionInfo[]>}
 */
export const definition = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 */
export const definitionAndBoundSpan = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.DefinitionAndBoundSpan,
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
    type: TsServerMessageType.Request,
    command: TsServerCommandType.DocumentHighlights,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.DocumentHighlights)
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
    type: TsServerMessageType.Request,
    command: TsServerCommandType.EncodedSemanticClassificationsFull,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(
      message,
      TsServerCommandType.EncodedSemanticClassificationsFull
    )
  }
  return message.body
}

/**
 * @param {any} server
 */
export const exit = async (server) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Exit,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').FileReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').FileReferencesResponse>}
 */
export const fileReferences = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.FileReferences,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.FileReferences)
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').FormatRequest['arguments']} params
 */
export const format = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Format,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CodeFixRequest['arguments']} params
 */
export const getCodeFixes = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetCodeFixes,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').GetEditsForFileRenameRequest['arguments']} params
 */
export const getEditsForFileRename = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetEditsForFileRename,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').OutliningSpansRequest['arguments']} params
 */
export const getOutliningSpans = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetOutliningSpans,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').SpanOfEnclosingCommentRequest['arguments']} params
 */
export const getSpanOfEnclosingComment = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetSpanOfEnclosingComment,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').GetSupportedCodeFixesRequest['arguments']} params
 */
export const getSupportedCodeFixes = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetSupportedCodeFixes,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ImplementationRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ImplementationResponse['body']>}
 */
export const implementation = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Implementation,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Implementation)
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').IndentationRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').IndentationResponse>}
 *
 */
export const indentation = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Indentation,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Indentation)
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').JsxClosingTagRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').JsxClosingTagResponse['body']|undefined>}
 */
export const jsxClosingTag = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.JsxClosingTag,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    if (message.message === 'No content available.') {
      return undefined
    }
    throw new TsServerError(message, TsServerCommandType.JsxClosingTag)
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').OrganizeImportsRequest['arguments']} params
 */
export const organizeImports = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').PrepareCallHierarchyRequest['arguments']} params
 */
export const prepareCallHierarchy = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.PrepareCallHierarchy,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyIncomingCallsRequest['arguments']} params
 */
export const provideCallHierarchyIncomingCalls = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideCallHierarchyIncomingCalls,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyOutgoingCallsRequest['arguments']} params
 */
export const provideCallHierarchyOutgoingCalls = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideCallHierarchyOutgoingCalls,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').InlayHintsRequest['arguments']} params
 */
export const provideInlayHints = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideInlayHints,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ReferencesResponseBody>}
 */
export const references = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').ReloadRequest['arguments']} params
 */
export const reload = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Reload,
    arguments: params,
  })
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').RenameRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').RenameResponseBody>}
 */
export const rename = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Rename,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Rename)
  }
  return message.body
}

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').SemanticDiagnosticsSyncRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').SemanticDiagnosticsSyncResponse>}
 */
export const semanticDiagnosticsSync = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').ToggleLineCommentRequest['arguments']} params
 */
export const toggleLineComment = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').ToggleMultilineCommentRequest['arguments']} params
 */
export const toggleMultilineComment = async (server, params) => {
  const message = await server.invoke({
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
 * @param {any} server
 * @param {import('typescript/lib/protocol').TypeDefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').TypeDefinitionResponse['body']>}
 */
export const typeDefinition = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.TypeDefinition,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.TypeDefinition)
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
    command: TsServerCommandType.UpdateOpen,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.UpdateOpen)
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
