import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import { getDiagnosticsFromTsResult2 } from '../GetDiagnosticFromTsResult2/GetDiagnosticFromTsResult2.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import * as PerformanceTrace from '../PerformanceTrace/PerformanceTrace.ts'

const loadedFilesByLanguageService = new WeakMap<object, readonly PerformanceTrace.PerformanceTraceLoadedFile[]>()
const firstPerformanceTraceByUri = new Map<string, PerformanceTrace.PerformanceTrace>()
const maxFirstPerformanceTraces = 8

const getLoadedFiles = (languageService: {
  getProgram: () => { getSourceFiles: () => readonly { fileName: string; text: string }[] } | undefined
}): readonly PerformanceTrace.PerformanceTraceLoadedFile[] => {
  const cached = loadedFilesByLanguageService.get(languageService)
  if (cached) return cached
  const loadedFiles = (languageService.getProgram()?.getSourceFiles() || []).map((sourceFile) => ({
    fileName: sourceFile.fileName,
    sizeBytes: new TextEncoder().encode(sourceFile.text).byteLength,
  }))
  loadedFilesByLanguageService.set(languageService, loadedFiles)
  return loadedFiles
}

export const getDiagnostics2 = async (
  textDocument: any,
  trace?: PerformanceTrace.MutablePerformanceTrace,
): Promise<readonly Diagnostic[]> => {
  const shouldCaptureFirstTrace =
    !firstPerformanceTraceByUri.has(textDocument.uri) && firstPerformanceTraceByUri.size < maxFirstPerformanceTraces
  const actualTrace =
    trace || (shouldCaptureFirstTrace ? PerformanceTrace.createPerformanceTrace(textDocument.uri) : undefined)
  const start = actualTrace ? performance.now() : 0
  try {
    const { fs, languageService } = PerformanceTrace.measure(actualTrace, 'languageService', () =>
      getOrCreateLanguageService(textDocument.uri, actualTrace),
    )
    PerformanceTrace.measure(actualTrace, 'documentUpdate', () => {
      fs.writeFile(textDocument.uri, textDocument.text)
    })
    const tsResult = PerformanceTrace.measure(actualTrace, 'semanticDiagnostics', () =>
      languageService.getSemanticDiagnostics(textDocument.uri),
    )
    const diagnostics = PerformanceTrace.measure(actualTrace, 'conversion', () =>
      getDiagnosticsFromTsResult2(textDocument.text, tsResult || []),
    )
    if (actualTrace) {
      actualTrace.loadedFiles = getLoadedFiles(languageService)
      actualTrace.diagnostics = {
        count: diagnostics.length,
      }
    }
    return diagnostics
  } catch (error) {
    if (actualTrace) {
      actualTrace.error = {
        details: PerformanceTrace.toErrorDetails(error),
        stage: 'semanticDiagnostics',
      }
    }
    throw error
  } finally {
    if (actualTrace) {
      actualTrace.totalDurationMs = performance.now() - start
      if (shouldCaptureFirstTrace) firstPerformanceTraceByUri.set(textDocument.uri, actualTrace)
    }
  }
}

export const getPerformanceTrace = async (textDocument: any): Promise<PerformanceTrace.PerformanceTrace> => {
  const trace = PerformanceTrace.createPerformanceTrace(textDocument.uri)
  const start = performance.now()
  try {
    await getDiagnostics2(textDocument, trace)
  } catch (error) {
    trace.error = {
      details: PerformanceTrace.toErrorDetails(error),
      stage: 'semanticDiagnostics',
    }
  }
  trace.totalDurationMs = performance.now() - start
  return trace
}

export const getFirstPerformanceTrace = async (textDocument: any): Promise<PerformanceTrace.PerformanceTrace> => {
  return firstPerformanceTraceByUri.get(textDocument.uri) || getPerformanceTrace(textDocument)
}
