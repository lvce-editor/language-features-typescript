// @ts-nocheck
const RE_LENGTH = /^Content-Length: (\d+)/

// const getChunks = (data) => {
//   const chunks = []
//   let remainingData = data
//   let contentIndex = 0
//   while (contentIndex < remainingData.length) {
//     const contentMatch = remainingData.match(RE_LENGTH)
//     if (!contentMatch) {
//       console.log('no match')
//       console.log(remainingData)
//       break
//     }
//     const contentMatchLength = contentMatch[0].length
//     const contentLength = parseInt(contentMatch[1], 10)
//     contentIndex = contentMatchLength
//     while (
//       remainingData[contentIndex] === ' ' ||
//       remainingData[contentIndex] === '\r' ||
//       remainingData[contentIndex] === '\n'
//     ) {
//       contentIndex++
//     }
//     const chunk = remainingData.slice(
//       contentIndex,
//       contentIndex + contentLength
//     )
//     chunks.push(chunk)
//     remainingData = remainingData.slice(contentIndex + chunk.length)
//   }
//   return chunks
// }

// const parseChunk = (chunk) => {
//   return JSON.parse(chunk)
// }

// export const parseTypeScriptRequests = (data) => {
//   const chunks = getChunks(data)
//   const result = chunks.map(parseChunk)
//   return result
// }

const backslashN = Buffer.from('\n', 'utf8')[0]
const backslashR = Buffer.from('\r', 'utf8')[0]

const startIndex = 'Content-Length: '.length // messages start with this

const EMPTY_BUFFER = Buffer.alloc(0)

export const createParser = ({ onMessage }) => {
  let buffer = EMPTY_BUFFER
  const append = (data) => {
    if (buffer.length > 0) {
      data = Buffer.concat([buffer, data])
    }
    while (true) {
      let endIndex = startIndex
      while (
        endIndex < data.length &&
        data[endIndex] !== backslashR &&
        data[endIndex] !== backslashN
      ) {
        endIndex++
      }
      const contentLengthString = data.slice(startIndex, endIndex).toString()
      const contentLength = Number.parseInt(contentLengthString, 10)
      let contentStartIndex = endIndex + 1
      while (
        data[contentStartIndex] === backslashR ||
        data[contentStartIndex] === backslashN
      ) {
        contentStartIndex++
      }
      if (contentStartIndex + contentLength < data.length + 2) {
        const content = data
          .subarray(contentStartIndex, contentStartIndex + contentLength)
          .toString()
        const parsed = JSON.parse(content)
        onMessage(parsed)
        let newEndIndex = contentStartIndex + contentLength
        while (
          data[newEndIndex] === backslashR ||
          data[newEndIndex] === backslashN
        ) {
          newEndIndex++
        }
        if (newEndIndex === data.length + 1) {
          buffer = EMPTY_BUFFER
          break
        }
        data = data.subarray(newEndIndex)
      } else {
        buffer = data
        break
      }
    }
    // TODO not sure whether slice or subarray is faster
  }
  return {
    append,
  }
}
