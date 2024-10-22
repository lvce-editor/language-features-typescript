export const getTextSync = (url: string): string => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', /* url */ url, /* async */ false)
  xhr.setRequestHeader('accept', 'text/plain')
  xhr.send(null)
  return xhr.responseText
}
