import * as fs from 'fs'

export const state = {
  writeStream: undefined,
}

const createWriteStream = () => {
  const writeStream = fs.createWriteStream('/tmp/ts-log.txt')
  return writeStream
}

const getWriteStream = () => {
  if (!state.writeStream) {
    state.writeStream = createWriteStream()
  }
  return state.writeStream
}

const write = (chunk) => {
  const writeStream = getWriteStream()
  writeStream.write(chunk)
}

export const receive = (message) => {
  write(
    JSON.stringify({
      received: message,
    }) + '\n'
  )
}

export const send = (message) => {
  write(
    JSON.stringify({
      sent: message,
    }) + '\n'
  )
}
