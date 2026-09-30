import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import { getDiagnosticsFromTsResult2 } from '../GetDiagnosticFromTsResult2/GetDiagnosticFromTsResult2.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import * as PerformanceTrace from '../PerformanceTrace/PerformanceTrace.ts'

const loadedFilesByLanguageService = new WeakMap<object, readonly PerformanceTrace.PerformanceTraceLoadedFile[]>()

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
  const { fs, languageService } = PerformanceTrace.measure(trace, 'languageService', () =>
    getOrCreateLanguageService(textDocument.uri, trace),
  )
  PerformanceTrace.measure(trace, 'documentUpdate', () => {
    fs.writeFile(textDocument.uri, textDocument.text)
  })
  const tsResult = PerformanceTrace.measure(trace, 'semanticDiagnostics', () =>
    languageService.getSemanticDiagnostics(textDocument.uri),
  )
  const diagnostics = PerformanceTrace.measure(trace, 'conversion', () =>
    getDiagnosticsFromTsResult2(textDocument.text, tsResult || []),
  )
  if (trace) {
    trace.loadedFiles = getLoadedFiles(languageService)
    trace.diagnostics = {
      count: diagnostics.length,
    }
  }
  return diagnostics
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
