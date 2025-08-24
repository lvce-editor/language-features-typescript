// TODO maybe use separate worker and atomics to sync

const RE_URL = /^[a-z\-]+\:\/\//

// TODO could also use origin private file system for this
export const getTextSync = (url: string): string => {
  if (!RE_URL.test(url)) {
    throw new Error('invalid url')
  }
  const xhr = new XMLHttpRequest()
  xhr.open('GET', /* url */ url, /* async */ false)
  xhr.setRequestHeader('Accept', 'text/plain')
  xhr.send(null)
  return xhr.responseText
}
