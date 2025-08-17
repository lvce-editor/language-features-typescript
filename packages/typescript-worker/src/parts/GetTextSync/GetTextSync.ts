// TODO maybe use separate worker and atomics to sync

export const getTextSync = (url) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', /* url */ url, /* async */ false)
  xhr.setRequestHeader('Accept', 'text/plain')
  xhr.send(null)
  return xhr.responseText
}
