export const getTextSync = (url) => {
  const xhr = new XMLHttpRequest()
  xhr.setRequestHeader('Accept', 'text/plain')
  xhr.open('GET', /* url */ url, /* async */ false)
  xhr.send(null)
  return xhr.responseText
}
