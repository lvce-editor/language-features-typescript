// TODO maybe use separate worker and atomics to sync

export const getTextSync = (url) => {
  if (!url.startsWith('http')) {
    throw new Error('invalid url')
  }
  // console.log({ url })
  const xhr = new XMLHttpRequest()
  xhr.open('GET', /* url */ url, /* async */ false)
  xhr.setRequestHeader('Accept', 'text/plain')
  xhr.send(null)
  return xhr.responseText
}
