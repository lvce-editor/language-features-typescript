import type {
  CloseRequest,
  CloseExternalProjectRequest,
  CommentSelectionRequest,
  BraceCompletionRequest,
  ChangeRequest,
  CompletionsRequest,
  CompletionDetailsResponse,
  CompletionDetailsRequest,
  CompletionInfo,
  CompileOnSaveAffectedFileListRequest,
  ConfigureRequest,
  ConfigureResponse,
  UpdateOpenRequest,
  DefinitionRequest,
  DefinitionInfo,
  DocumentHighlightsRequest,
  DocumentHighlightsResponse,
  EncodedSemanticClassificationsRequest,
  EncodedSemanticClassificationsResponse,
  FileReferencesRequest,
  FileReferencesResponse,
  ImplementationRequest,
  ImplementationResponse,
} from 'typescript/lib/protocol'

export const braceCompletion: (
  server: TsServer,
  params: BraceCompletionRequest['arguments']
) => Promise<unknown>

export const change: (
  server: TsServer,
  params: ChangeRequest['arguments']
) => void

export const close: (
  server: TsServer,
  params: CloseRequest['arguments']
) => void

export const closeExternalProject: (
  server: TsServer,
  params: CloseExternalProjectRequest['arguments']
) => void

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

export const configure: (
  server: TsServer,
  params: ConfigureRequest['arguments']
) => Promise<ConfigureResponse>

export const definition: (
  server: TsServer,
  params: DefinitionRequest['arguments']
) => Promise<readonly DefinitionInfo[]>

export const documentHighlights: (
  server: TsServer,
  params: DocumentHighlightsRequest['arguments']
) => Promise<DocumentHighlightsResponse['body']>

export const encodedSemanticClassificationsFull: (
  server: TsServer,
  params: EncodedSemanticClassificationsRequest['arguments']
) => Promise<EncodedSemanticClassificationsResponse['body']>

export const fileReferences: (
  server: TsServer,
  params: FileReferencesRequest['arguments']
) => Promise<FileReferencesResponse['body']>

export const implementation: (
  server: TsServer,
  params: ImplementationRequest['arguments']
) => Promise<ImplementationResponse['body']>

export const updateOpen: (
  server: TsServer,
  params: UpdateOpenRequest['arguments']
) => Promise<void>
