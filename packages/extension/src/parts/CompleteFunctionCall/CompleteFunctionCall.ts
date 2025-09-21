import * as GetParameterListParts from '../GetParameterListParts/GetParameterListParts.ts'
import * as Character from '../Character/Character.ts'

const getParameterSnippet = (parameterParts) => {
  const texts = []
  for (const parameterPart of parameterParts) {
    texts.push(parameterPart.text)
  }
  return texts.join(Character.CommaSpace)
}

export const completeFunctionCall = (label, displayParts) => {
  const parameterParts = GetParameterListParts.getParameterListParts(displayParts)
  const parameterSnippet = getParameterSnippet(parameterParts)
  let snippet = ''
  snippet += label
  snippet += '('
  snippet += parameterSnippet
  snippet += ')'
  return snippet
}
