import { toastErrOp, redirect } from './util.js'
import * as constants from '../shared/constants.js'

export class API {
  constructor(prefix = 'api', auth = true) {
    this.prefix = '/' + prefix
    this.auth = auth
  }

  async jsonToast(op, url, req = {}) {
    let data
    try {
      data = await this.json(url, req)
      return data
    } catch (err) {
      toastErrOp(op, err)
      return null
    }
  }

  async json(url, req = {}) {
    if (req.body && typeof req.body === 'object') {
      req.body = JSON.stringify(req.body)
    }

    if (!req.headers) req.headers = {}
    if (!req.headers['Content-Type']) {
      req.headers['Content-Type'] = 'application/json'
    }

    const resp = await this.fetch(url, req)
    return await resp.json()
  }

  doRedirect(message) {
    redirect('/login.html', { message })
  }

  setToken(req) {
    if (!req.headers) req.headers = {}
    const token = localStorage.getItem('token')
    if (!token) {
      return this.doRedirect()
    }
    req.headers[constants.tokenHeader] = token
  }

  async resp(url, req = {}) {
    if (!req) req = {}
    if (this.auth) {
      this.setToken(req)
    }

    url = this.prefix + url
    if (req.params) {
      const ps = Object.keys(req.params)
        .filter((p) => req.params[p] != null && req.params[p] != undefined)
        .map((p) => `${p}=${encodeURIComponent(req.params[p])}`)
        .join('&')
      url += '?' + ps
      delete req.params
    }

    const resp = await fetch(url, req)
    if (resp.status === 403) {
      return this.doRedirect('Session Expired. Please log back in.')
    }

    return resp
  }

  async fetch(url, req = {}) {
    if (req.body && !req.method) {
      req.method = 'POST'
    }
    const resp = await this.resp(url, req)

    if (!resp.ok && !req.return) {
      let body = '<No Response Body>'
      try {
        const respBody = await resp.json()
        if (respBody['err']) {
          body = JSON.stringify(respBody['err'], null, 2)
        } else {
          body = JSON.stringify(respBody, null, 2)
        }
      } catch {}
      throw new Error(`API Failure: ${resp.status} ${resp.statusText}: ${body}`)
    }
    return resp
  }
}

export default new API()