import { fork, spawn } from 'node:child_process'

const METHOD_FORK = 1
const METHOD_SPAWN = 2

/**
 * @type {number}
 */
const METHOD_PREFERRED = METHOD_SPAWN

// TODO spawn seems to be much faster than fork for unknown reasons

const createViaSpawn = (args, options) => {
  const nodePath = process.argv[0]
  const child = spawn(nodePath, args, options)
  return child
}

const createViaFork = (args, options) => {
  const child = fork(args[0], {
    execArgv: args.slice(1),
    ...options,
  })
  return child
}

const createChild = (args, options) => {
  switch (METHOD_PREFERRED) {
    case METHOD_FORK:
      return createViaFork(args, options)
    case METHOD_SPAWN:
      return createViaSpawn(args, options)
    default:
      throw new Error('unknown method')
  }
}

/**
 *
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions} options
 * @returns
 */
export const create = (args, options = {}) => {
  const child = createChild(args, options)
  return child
}
