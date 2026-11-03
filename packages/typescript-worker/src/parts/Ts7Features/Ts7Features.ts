import {
  createScanner,
  getChildren,
  getNameOfDeclaration,
  getTouchingPropertyName,
  getTokenAtPosition,
  isBlock,
  isShorthandPropertyAssignment,
  isCallExpression,
  isClassDeclaration,
  isClassExpression,
  isFunctionDeclaration,
  isIdentifier,
  isPrivateIdentifier,
  isInterfaceDeclaration,
  isMethodDeclaration,
  isNewExpression,
  isParameterDeclaration,
  isPropertyAccessExpression,
  isQualifiedName,
  isStringLiteralLikeNode,
  isTypeAliasDeclaration,
  isVariableDeclaration,
  isTypeReferenceNode,
  NodeFlags,
  SyntaxKind,
  type Declaration,
  type Node,
  type SourceFile,
} from 'typescript7/ast'
import {
  fileNameToDocumentURI,
  SymbolFlags,
  TypeFormatFlags,
  type Project,
  type Symbol as CompilerSymbol,
} from 'typescript7/sync'
import type { DocumentSymbol } from '../DocumentSymbol/DocumentSymbol.ts'
import { getOffset } from '../GetOffset/GetOffset.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'
import { createActions } from '../Ts7Actions/Ts7Actions.ts'

const walk = (node: Node, visit: (node: Node) => void): void => {
  visit(node)
  node.forEachChild((child) => {
    walk(child, visit)
  })
}

const nameOf = (node: Node): Node => getNameOfDeclaration(node as Declaration) ?? node
const isNameToken = (node: Node): boolean =>
  isIdentifier(node) ||
  isPrivateIdentifier(node) ||
  isStringLiteralLikeNode(node) ||
  node.kind === SyntaxKind.ThisKeyword ||
  node.kind === SyntaxKind.SuperKeyword

export const createFeatures = (project: Project, source: SourceFile, libraryUri: (name: string) => string) => {
  const { checker, program } = project
  const actions = createActions(project, source)
  const tokenAt = (offset: number) => getTouchingPropertyName(source, Math.max(0, Math.min(offset, source.text.length)))
  const resolveAlias = (symbol: CompilerSymbol) =>
    symbol.flags & SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
  const symbolAt = (offset: number) => {
    const token = tokenAt(offset)
    if (!isNameToken(token) || offset < token.getStart(source) || offset > token.end) return undefined
    const symbol = checker.getSymbolAtPosition(source.fileName, offset)
    return symbol ? resolveAlias(symbol) : undefined
  }
  const uriOf = (file: SourceFile) =>
    file.fileName.startsWith('bundled:///libs/')
      ? libraryUri(file.fileName.slice('bundled:///libs/'.length))
      : fileNameToDocumentURI(file.fileName)
  const location = (node: Node) => {
    const file = node.getSourceFile()
    const startOffset = node.getStart(file)
    const endOffset = node.end
    const start = getPositionAt(file.text, startOffset)
    const end = getPositionAt(file.text, endOffset)
    return {
      endColumnIndex: end.columnIndex,
      endOffset,
      endRowIndex: end.rowIndex,
      startColumnIndex: start.columnIndex,
      startOffset,
      startRowIndex: start.rowIndex,
      uri: uriOf(file),
    }
  }
  const declarations = (symbol: CompilerSymbol | undefined) =>
    (symbol?.declarations ?? []).flatMap((handle) => {
      const node = handle.resolve(project)
      return node ? [node] : []
    })
  const referenceNodes = (offset: number): Node[] => {
    const token = tokenAt(offset)
    if (
      offset < token.getStart(source) ||
      offset > token.end ||
      (!isIdentifier(token) && !isStringLiteralLikeNode(token))
    )
      return []
    const result = project.languageService.getReferencedSymbolsForNode(token, offset)
    const seen = new Set<string>()
    return result
      .flatMap((entry) => [entry.definition, ...entry.references])
      .flatMap((handle) => {
        const node = handle.resolve(project)
        if (!node) return []
        const name = nameOf(node)
        const key = `${name.getSourceFile().fileName}:${name.getStart()}:${name.end}`
        if (seen.has(key)) return []
        seen.add(key)
        return [name]
      })
      .toSorted(
        (a, b) =>
          Number(b.getSourceFile() === source) - Number(a.getSourceFile() === source) ||
          a.getSourceFile().fileName.localeCompare(b.getSourceFile().fileName) ||
          a.pos - b.pos,
      )
  }
  const describe = (symbol: CompilerSymbol): string => {
    const declaration = declarations(symbol)[0]
    const type = checker.typeToString(checker.getTypeOfSymbol(symbol), declaration, TypeFormatFlags.NoTruncation)
    const { name } = symbol
    if (!declaration) return `${name}: ${type}`
    if (isVariableDeclaration(declaration)) {
      const keyword = declaration.parent.flags & NodeFlags.Const ? 'const' : 'let'
      return `${keyword} ${name}: ${type}`
    }
    if (isFunctionDeclaration(declaration)) return `function ${name}${type.replace(' => ', ': ')}`
    if (isParameterDeclaration(declaration)) return `(parameter) ${name}: ${type}`
    if (isMethodDeclaration(declaration)) return `(method) ${name}${type.replace(' => ', ': ')}`
    if (symbol.flags & SymbolFlags.Property) return `(property) ${name}: ${type}`
    if (isInterfaceDeclaration(declaration)) return `interface ${name}`
    if (isClassDeclaration(declaration) || isClassExpression(declaration)) return `class ${name}`
    if (isTypeAliasDeclaration(declaration)) return `type ${name} = ${declaration.type.getText()}`
    return `${name}: ${type}`
  }
  const hover = (offset: number) => {
    const token = tokenAt(offset)
    if (offset < token.getStart() || offset > token.end) return undefined
    const symbol = symbolAt(offset)
    if (!symbol) return undefined
    return {
      displayString: describe(symbol),
      documentation: symbol.getDocumentationComment(checker),
      languageId: 'typescript',
    }
  }
  const documentSymbols = (): readonly DocumentSymbol[] => {
    const collect = (node: Node): DocumentSymbol[] => {
      const children: DocumentSymbol[] = []
      node.forEachChild((child) => {
        children.push(...collect(child))
      })
      const kinds = new Map([
        [SyntaxKind.FunctionDeclaration, 'function'],
        [SyntaxKind.ClassDeclaration, 'class'],
        [SyntaxKind.InterfaceDeclaration, 'interface'],
        [SyntaxKind.TypeAliasDeclaration, 'type'],
        [SyntaxKind.EnumDeclaration, 'enum'],
        [SyntaxKind.EnumMember, 'enum member'],
        [SyntaxKind.ModuleDeclaration, 'module'],
        [SyntaxKind.MethodDeclaration, 'method'],
        [SyntaxKind.PropertyDeclaration, 'property'],
        [SyntaxKind.PropertySignature, 'property'],
        [SyntaxKind.GetAccessor, 'getter'],
        [SyntaxKind.SetAccessor, 'setter'],
        [SyntaxKind.VariableDeclaration, node.parent?.flags & NodeFlags.Const ? 'const' : 'let'],
      ])
      const kind = kinds.get(node.kind)
      const name = getNameOfDeclaration(node as Declaration)
      if (!kind || !name) return children
      return [
        {
          ...(children.length > 0 && { children }),
          endOffset: node.end,
          kind,
          name: name.getText(source),
          selectionEndOffset: name.end,
          selectionStartOffset: name.getStart(source),
          startOffset: node.getStart(source),
        },
      ]
    }
    return collect(source)
  }
  const definition = (offset: number, typeDefinition = false) => {
    const token = tokenAt(offset)
    if (!isNameToken(token) || offset < token.getStart(source) || offset > token.end) return undefined
    const symbol = typeDefinition ? checker.getTypeAtPosition(source.fileName, offset)?.getSymbol() : symbolAt(offset)
    const node = declarations(symbol)[0]
    return node ? location(nameOf(node)) : undefined
  }
  const references = (offset: number) => referenceNodes(offset).map(location)
  const prepareRename = (offset: number) => {
    const token = tokenAt(offset)
    if (
      !isIdentifier(token) ||
      !symbolAt(offset) ||
      declarations(symbolAt(offset)).some((node) => node.getSourceFile().isDeclarationFile)
    )
      return undefined
    return {
      placeholder: token.getText(source),
      range: { length: token.end - token.getStart(source), start: token.getStart(source) },
    }
  }
  const rename = (offset: number, newName: string) => {
    if (!prepareRename(offset)) throw new Error('This symbol cannot be renamed')
    const scanner = createScanner(true, source.languageVariant, newName)
    if (scanner.scan() !== SyntaxKind.Identifier || scanner.getTokenEnd() !== newName.length)
      throw new Error('Invalid TypeScript identifier')
    return {
      canRename: true,
      edits: referenceNodes(offset).map((node) => ({
        edits: [
          {
            deleted: node.end - node.getStart(),
            inserted: isShorthandPropertyAssignment(node.parent) ? `${node.getText()}: ${newName}` : newName,
            offset: node.getStart(),
          },
        ],
        uri: uriOf(node.getSourceFile()),
      })),
    }
  }
  const implementations = (offset: number) => {
    const symbol = symbolAt(offset)
    if (!symbol) return []
    const result: Node[] = []
    const symbolDeclarations = declarations(symbol)
    for (const node of symbolDeclarations) {
      if (
        (isVariableDeclaration(node) && node.initializer) ||
        (isFunctionDeclaration(node) && node.body) ||
        (isMethodDeclaration(node) && node.body)
      )
        result.push(nameOf(node))
    }
    for (const name of program.getSourceFileNames()) {
      const file = program.getSourceFile(name)
      if (!file || file.isDeclarationFile) continue
      walk(file, (node) => {
        if (!isClassDeclaration(node) && !isClassExpression(node)) return
        const clauses = node.heritageClauses ?? []
        for (const clause of clauses) {
          for (const base of clause.types) {
            const baseSymbol = checker.getSymbolAtLocation(isTypeReferenceNode(base) ? base.typeName : base.expression)
            if (baseSymbol && resolveAlias(baseSymbol).id === symbol.id) result.push(nameOf(node))
          }
        }
      })
    }
    return result.map((node) => {
      const item = location(node)
      const lineText = node.getSourceFile().text.split('\n')[item.startRowIndex]
      return {
        ...item,
        endOffset: item.endRowIndex === item.startRowIndex ? item.endColumnIndex : lineText.length,
        lineText,
        startOffset: item.startColumnIndex,
      }
    })
  }
  const signatureHelp = (offset: number) => {
    let node: Node | undefined = getTokenAtPosition(source, Math.max(0, offset - 1))
    while (node && !isCallExpression(node) && !isNewExpression(node)) node = node.parent
    if (!node || (!isCallExpression(node) && !isNewExpression(node))) return undefined
    const call = node
    const signature = checker.getResolvedSignature(call)
    if (checker.isUnknownSignature(signature)) return undefined
    const parameters = signature.getParameters().map((parameter) => {
      const declaration = declarations(parameter)[0]
      const optional =
        declaration && isParameterDeclaration(declaration) && (declaration.questionToken || declaration.initializer)
          ? '?'
          : ''
      const rest = declaration && isParameterDeclaration(declaration) && declaration.dotDotDotToken ? '...' : ''
      return {
        documentation: parameter.getDocumentationComment(checker),
        label: `${rest}${parameter.name}${optional}: ${checker.typeToString(checker.getTypeOfSymbol(parameter))}`,
      }
    })
    const symbol = checker.getSymbolAtLocation(call.expression)
    return {
      activeParameter: (call.arguments ?? []).filter((argument) => argument.end < offset).length,
      activeSignature: 0,
      signatures: [
        {
          documentation: symbol?.getDocumentationComment(checker) ?? '',
          label: `${call.expression.getText(source)}(${parameters.map((parameter) => parameter.label).join(', ')}): ${checker.typeToString(signature.getReturnType())}`,
          parameters,
        },
      ],
    }
  }
  const selections = (positions: readonly number[] | Uint32Array): number[] => {
    const result: number[] = []
    for (let index = 0; index + 3 < positions.length; index += 4) {
      const anchor = getOffset(source.text, positions[index], positions[index + 1])
      const active = getOffset(source.text, positions[index + 2], positions[index + 3])
      const start = Math.min(anchor, active),
        end = Math.max(anchor, active)
      const ranges: { start: number; end: number }[] = []
      const add = (rangeStart: number, rangeEnd: number) => {
        if (rangeStart <= start && rangeEnd >= end && (rangeStart < start || rangeEnd > end))
          ranges.push({ end: rangeEnd, start: rangeStart })
      }
      const visit = (node: Node) => {
        if (node.pos > start || node.end < end) return
        const rangeStart = node.getStart(source)
        const rangeEnd = node === source ? source.text.trimEnd().length : node.end
        add(rangeStart, rangeEnd)
        if (isBlock(node)) add(rangeStart + 1, rangeEnd - 1)
        if (isStringLiteralLikeNode(node)) add(rangeStart + 1, rangeEnd - 1)
        for (const child of getChildren(node, source)) visit(child)
      }
      visit(source)
      ranges.sort((a, b) => a.end - a.start - (b.end - b.start))
      const range = ranges[0]
      if (!range) {
        result.push(...[...positions].slice(index, index + 4))
        continue
      }
      const left = getPositionAt(source.text, range.start),
        right = getPositionAt(source.text, range.end)
      result.push(
        ...(anchor <= active
          ? [left.rowIndex, left.columnIndex, right.rowIndex, right.columnIndex]
          : [right.rowIndex, right.columnIndex, left.rowIndex, left.columnIndex]),
      )
    }
    return result
  }
  const braceCompletion = (offset: number, openingBrace: string): boolean => {
    const scanner = createScanner(false, source.languageVariant, source.text)
    while (scanner.scan() !== SyntaxKind.EndOfFile) {
      if (scanner.getTokenEnd() < offset) continue
      const kind = scanner.getToken()
      const excluded = [
        SyntaxKind.SingleLineCommentTrivia,
        SyntaxKind.MultiLineCommentTrivia,
        SyntaxKind.StringLiteral,
        SyntaxKind.NoSubstitutionTemplateLiteral,
        SyntaxKind.TemplateHead,
        SyntaxKind.TemplateMiddle,
        SyntaxKind.TemplateTail,
        SyntaxKind.RegularExpressionLiteral,
      ]
      if (!excluded.includes(kind)) return true
      if (kind === SyntaxKind.SingleLineCommentTrivia || scanner.isUnterminated()) return false
      return scanner.getTokenEnd() === offset && !['"', "'", '`'].includes(openingBrace)
    }
    return true
  }
  const fileReferences = () =>
    program.getSourceFileNames().flatMap((name) => {
      const file = program.getSourceFile(name)
      if (!file) return []
      return file.imports
        .filter(isStringLiteralLikeNode)
        .filter(
          (specifier) =>
            program.getResolvedModuleFromModuleSpecifier(specifier, file.fileName)?.resolvedFileName ===
            source.fileName,
        )
        .map(location)
    })
  const exportCompletions = (offset: number, prefix: string) => {
    const token = tokenAt(offset)
    if (!prefix || !isIdentifier(token) || token.end < offset) return []
    const { parent } = token
    if (
      (isPropertyAccessExpression(parent) && parent.name === token) ||
      (isQualifiedName(parent) && parent.right === token)
    )
      return []
    if (getNameOfDeclaration(parent as Declaration) === token) return []
    return actions
      .exportedSymbols()
      .entries()
      .flatMap(([name, symbols]) => {
        if (name === 'default' || !name.toLowerCase().startsWith(prefix.toLowerCase())) return []
        return symbols.map((symbol) => ({
          completionSource: uriOf(declarations(symbol)[0].getSourceFile()),
          kind: symbol.flags & SymbolFlags.Function ? 3 : 6,
          name,
          sortText: '16',
        }))
      })
      .toArray()
  }
  const resolveCompletion = (offset: number, requestedName: string, item: Record<string, unknown>) => {
    const name = typeof item.completionName === 'string' ? item.completionName : requestedName
    const entry = project.languageService
      .getCompletionsAtPosition(source.fileName, offset, { includeSymbol: true })
      ?.entries.find((entry) => entry.name === name)
    const candidates = typeof item.completionSource === 'string' ? (actions.exportedSymbols().get(name) ?? []) : []
    const exported = candidates.find((symbol) =>
      declarations(symbol).some((declaration) => uriOf(declaration.getSourceFile()) === item.completionSource),
    )
    const symbol = entry?.symbol ?? exported
    if (!symbol) return item
    const signature = checker.getTypeOfSymbol(symbol).getCallSignatures()[0]
    let snippet = typeof item.snippet === 'string' ? item.snippet : name
    if (signature && !source.text.slice(offset).trimStart().startsWith('(')) {
      const required = signature.getParameters().filter((parameter) => {
        const declaration = declarations(parameter)[0]
        return (
          isParameterDeclaration(declaration) &&
          !declaration.questionToken &&
          !declaration.initializer &&
          !declaration.dotDotDotToken &&
          parameter.name !== 'this'
        )
      })
      snippet = `${name}(${required.map((parameter) => parameter.name).join(', ')})`
    }
    return { ...item, detail: describe(symbol), documentation: symbol.getDocumentationComment(checker), snippet }
  }
  return {
    fileReferences,
    resolveCompletion,
    ...actions,
    braceCompletion,
    definition,
    documentSymbols,
    exportCompletions,
    hover,
    implementations,
    prepareRename,
    references,
    rename,
    selections,
    signatureHelp,
  }
}
