// for reference, see https://github.com/Microsoft/TypeScript/blob/main/lib/protocol.d.ts#L5

import VError from 'verror'
import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

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
 * @param {any} server
 * @param {import('typescript/lib/protocol').UpdateOpenRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').Response>}
 */
export const updateOpen = async (server, params) => {
  const message = await server.invoke({
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
