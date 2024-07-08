import log from './log.js'
import toast from '../widgets/toast.js'

export function isHTTPS() {
  return window.location.protocol.toLowerCase().startsWith('https')
}

export function redirect(url = '/', params = {}) {
  if (typeof params === 'string') {
    params = { message: params }
  }
  params.from = window.location.href
  if (params) {
    url +=
      '?' +
      Object.keys(params)
        .map((k) => `${k}=${encodeURIComponent(params[k])}`)
        .join('&')
  }
  window.location.href = url
}

export function toastErrOp(op, err, sticky, time) {
  toastErr(`An error occurred while ${op}`, err, '#toasts', sticky, time)
}

export function toastErr(msg, err, el, sticky, time) {
  log.error(msg, err)
  toast(msg, el, sticky, time)
}

export function getParam(name, dfault = null) {
  const params = new URLSearchParams(window.location.search)
  const v = params.get(name)
  if (v == null || v == undefined) return dfault
  return v
}

export function setParam(name, val) {
  const url = new URL(window.location.href)
  url.searchParams.set(name, val)
  if (history.pushState) {
    window.history.pushState({ path: url.toString() }, '', url.toString())
    return
  }
  window.location.href = url.toString()
}

let sheet

export function addStyle(selector, rules, index) {
  if (sheet === undefined) {
    sheet = createStylesheet()
  }

  if (index === undefined) {
    index = sheet.cssRules.length
  }

  sheet.insertRule(selector + '{' + rules + '}', index)
}

export function createStylesheet() {
  var style = document.createElement('style')
  style.appendChild(document.createTextNode(''))
  document.head.appendChild(style)
  return style.sheet
}

export function isElementInViewport(el, outer, heightOverride, widthOverride) {
  let height = window.innerHeight || document.documentElement.clientHeight
  let width = window.innerWidth || document.documentElement.clientWidth
  if (outer) {
    height = outer.getBoundingClientRect().height
    width = outer.getBoundingClientRect().width
  }
  if (heightOverride) {
    height = heightOverride
  }
  if (widthOverride) {
    width = widthOverride
  }

  var rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= height &&
    rect.right <= width
  )
}