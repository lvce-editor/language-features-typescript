import type {
  CommentSelectionRequest,
  CompileOnSaveAffectedFileListRequest,
  CompletionDetailsRequest,
  CompletionDetailsResponse,
  CompletionInfo,
  CompletionsRequest,
  EncodedSemanticClassificationsRequest,
  EncodedSemanticClassificationsResponse,
  ImplementationRequest,
  ImplementationResponse,
  UpdateOpenRequest,
} from 'typescript/lib/protocol'

export const commentSelection: (
  server: TsServer,
  params: CommentSelectionRequest['arguments']
) => Promise<unknown>

export const completionDetails: (
  server: TsServer,
  params: CompletionDetailsRequest['arguments']
) => Promise<CompletionDetailsResponse>

export const completionInfo: (
  server: TsServer,
  params: CompletionsRequest['arguments']
) => Promise<CompletionInfo>

export const compileOnSaveAffectedFileList: (
  server: TsServer,
  params: CompileOnSaveAffectedFileListRequest['arguments']
) => Promise<void>

export const encodedSemanticClassificationsFull: (
  server: TsServer,
  params: EncodedSemanticClassificationsRequest['arguments']
) => Promise<EncodedSemanticClassificationsResponse['body']>

export const implementation: (
  server: TsServer,
  params: ImplementationRequest['arguments']
) => Promise<ImplementationResponse['body']>

export const updateOpen: (
  server: TsServer,
  params: UpdateOpenRequest['arguments']
) => Promise<void>
