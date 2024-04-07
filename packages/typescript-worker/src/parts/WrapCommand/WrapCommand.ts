import * as Position from '../Position/Position.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const wrapCommand = (fn: any) => {
  const wrappedCommand = (...args) => {
    return fn(TypeScriptRpc, Position, ...args)
  }
  return wrappedCommand
}
