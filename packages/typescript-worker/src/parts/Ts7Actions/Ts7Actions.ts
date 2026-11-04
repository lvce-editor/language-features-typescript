import {
  SyntaxKind,
  getTokenAtPosition,
  isImportDeclaration,
  isNamedImports,
  isObjectLiteralExpression,
  type ImportDeclaration,
  type Node,
  type SourceFile,
} from 'typescript7/ast'
import { SymbolFlags, type Project, type TextEdit, type Symbol as CompilerSymbol } from 'typescript7/sync'

const editorEdits = (edits: readonly TextEdit[]) =>
  edits.map((edit) => ({ endOffset: edit.end, inserted: edit.newText, startOffset: edit.pos }))

export const createActions = (project: Project, source: SourceFile) => {
  const { checker, languageService, program } = project
  const imports = source.statements.filter(isImportDeclaration)
  const isUsed = (name: Node) => {
    const symbol = checker.getSymbolAtLocation(name)
    // Preserve unresolved or unknown bindings rather than guess at their usage.
    return (
      !symbol ||
      checker.getReferencesToSymbolInFile(source.fileName, symbol).some((handle) => {
        const node = handle.resolve(project)
        return node && imports.every((statement) => !(node.pos >= statement.pos && node.end <= statement.end))
      })
    )
  }
  const usedBindings = (clause: NonNullable<ImportDeclaration['importClause']>) => {
    const bindings: string[] = []
    if (clause.name && isUsed(clause.name)) bindings.push(clause.name.getText(source))
    const named = clause.namedBindings
    if (!named) return bindings
    if (!isNamedImports(named)) {
      if (isUsed(named.name)) bindings.push(named.getText(source))
      return bindings
    }
    const used = named.elements.filter((element) => isUsed(element.name))
    if (used.length > 0) bindings.push(`{ ${used.map((element) => element.getText(source)).join(', ')} }`)
    return bindings
  }
  const importEdits = () =>
    imports.flatMap((statement) => {
      const clause = statement.importClause
      if (!clause) return []
      const start = statement.getStart(source)
      const original = statement.getText(source)
      // Rewriting comments embedded in a clause could lose their intended attachment.
      if (original.includes('/*') || original.includes('//')) return []
      const bindings = usedBindings(clause)
      if (bindings.length === 0) {
        let { end } = statement
        while (source.text[end] === ' ' || source.text[end] === '\t') end++
        if (source.text[end] === '\r') end++
        if (source.text[end] === '\n') end++
        return [{ end, newText: '', pos: start }]
      }
      const replacement = `import ${clause.phaseModifier === SyntaxKind.TypeKeyword ? 'type ' : ''}${bindings.join(', ')} from ${source.text.slice(statement.moduleSpecifier.getStart(source), statement.end)}`
      return replacement === original ? [] : [{ end: statement.end, newText: replacement, pos: start }]
    })
  const exportedSymbols = () => {
    const exports = new Map<string, CompilerSymbol[]>()
    for (const name of program.getSourceFileNames()) {
      if (name.startsWith('bundled:///libs/')) continue
      const file = program.getSourceFile(name)
      if (!file || file === source || program.isSourceFileDefaultLibrary(file)) continue
      const module = checker.getSymbolOfSourceFile(file.fileName)
      if (!module) continue
      for (const symbol of checker.getExportsOfModule(module)) {
        const candidates = exports.get(symbol.name) ?? []
        candidates.push(symbol)
        exports.set(symbol.name, candidates)
      }
    }
    return exports
  }
  const missingImports = (offset?: number) => {
    const missing = program
      .getSemanticDiagnostics(source.fileName)
      .filter(
        (diagnostic) =>
          (diagnostic.code === 2304 || diagnostic.code === 2552) &&
          diagnostic.pos >= 0 &&
          (offset === undefined || (diagnostic.pos <= offset && diagnostic.end >= offset)),
      )
    if (missing.length === 0) return []
    const exports = exportedSymbols()
    const symbols = new Map<string, CompilerSymbol>()
    for (const diagnostic of missing) {
      const name = source.text.slice(diagnostic.pos, diagnostic.end)
      const candidates = exports.get(name)
      // Ambiguous candidates belong in a user choice, never an arbitrary import.
      if (candidates?.length === 1) symbols.set(name, candidates[0])
    }
    return symbols.size > 0
      ? editorEdits(languageService.getImportEditsForSymbols(source.fileName, symbols.values().toArray()))
      : []
  }
  const missingProperties = (offset: number) => {
    let node = getTokenAtPosition(source, Math.max(0, offset - 1))
    while (node && !isObjectLiteralExpression(node)) node = node.parent
    if (!node || !isObjectLiteralExpression(node)) return []
    const expected = checker.getContextualType(node)
    const actual = checker.getTypeAtLocation(node)
    const properties =
      expected
        ?.getProperties()
        .filter((property) => !(property.flags & SymbolFlags.Optional) && !actual.getProperty(property.name)) ?? []
    const defaults = new Map([
      ['string', '""'],
      ['number', '0'],
      ['boolean', 'false'],
    ])
    const values = properties.map((property) => {
      const type = checker.typeToString(checker.getTypeOfSymbol(property))
      const value = defaults.get(type) ?? 'undefined'
      const name = /^[$\p{ID_Start}][$\p{ID_Continue}]*$/u.test(property.name)
        ? property.name
        : JSON.stringify(property.name)
      return `${name}: ${value}`
    })
    if (values.length === 0) return []
    const last = node.properties.at(-1)
    const pos = last?.end ?? node.getStart(source) + 1
    return [
      {
        edits: [{ endOffset: pos, inserted: `${last ? ',' : ''}\n${values.join(',\n')}\n`, startOffset: pos }],
        kind: 'quickfix',
        name: 'Add missing properties',
      },
    ]
  }
  const quickFixes = (offset: number) => {
    const actions: { name: string; kind: string; edits: ReturnType<typeof editorEdits> }[] = []
    const diagnostic = program
      .getSemanticDiagnostics(source.fileName)
      .filter((item) => item.pos >= 0 && item.pos <= offset && item.end >= offset)
    for (const item of diagnostic) {
      const suggestion = item.text.match(/Did you mean '([^']+)'\?/)
      if (suggestion && [2551, 2552, 2561].includes(item.code))
        actions.push({
          edits: [{ endOffset: item.end, inserted: suggestion[1], startOffset: item.pos }],
          kind: 'quickfix',
          name: `Change spelling to '${suggestion[1]}'`,
        })
    }
    const missing = missingImports(offset)
    if (missing.length > 0) actions.push({ edits: missing, kind: 'quickfix', name: 'Add missing import' })
    for (const statement of imports) {
      if (offset < statement.getStart(source) || offset > statement.end) continue
      const edits = importEdits().filter((edit) => edit.pos === statement.getStart(source))
      if (edits.length > 0)
        actions.push({
          edits: editorEdits(edits),
          kind: 'quickfix',
          name: `Remove import from '${statement.moduleSpecifier.getText(source).slice(1, -1)}'`,
        })
    }
    if (diagnostic.some((item) => [2739, 2741, 2345].includes(item.code))) actions.push(...missingProperties(offset))
    return actions
  }
  return {
    addMissingImports: () => missingImports(),
    exportedSymbols,
    organizeImports: () => editorEdits(importEdits()),
    quickFixes,
  }
}
