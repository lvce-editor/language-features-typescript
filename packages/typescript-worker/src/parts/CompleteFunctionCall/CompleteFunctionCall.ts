import * as Character from '../Character/Character.ts'
import * as GetParameterListParts from '../GetParameterListParts/GetParameterListParts.ts'

const getParameterSnippet = (parameterParts: any[]) => {
  const texts: string[] = []
  for (const parameterPart of parameterParts) {
    texts.push(parameterPart.text)
  }
  return texts.join(Character.CommaSpace)
}

export const completeFunctionCall = (label: string, displayParts: any[]) => {
  const parameterParts = GetParameterListParts.getParameterListParts(displayParts)
  const parameterSnippet = getParameterSnippet(parameterParts)
  let snippet = ''
  snippet += label
  snippet += '('
  snippet += parameterSnippet
  snippet += ')'
  return snippet
}
