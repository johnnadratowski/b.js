import * as globals from './globals.js'

import livereload, { LiveReloadServer } from 'livereload'
import livereloadMiddleware from 'connect-livereload'
import { Application, Response } from 'express'

let lrServer: LiveReloadServer
export function startLR(app: Application, watchDir: string) {
  console.log('Starting LiveReload')

  app.use(livereloadMiddleware({ port: globals.lrPort }))
  lrServer = livereload.createServer(() => {
    console.log(`Started LiveReload on ${globals.lrPort}`)
  })
  lrServer.watch(watchDir)

  let lrRunning = true
  app.get('/pauseLR', (_: any, res: Response) => {
    console.log('Pausing Livereload')
    if (!lrRunning) {
      console.log('Livereload already paused')
      res.status(400).send()
      return
    }

    // @ts-ignore
    lrServer.watcher.unwatch(watchDir)
    lrRunning = false
    console.log('Unwatching files for LiveReload')
    res.status(204).send()
  })
  app.get('/startLR', (_: any, res: Response) => {
    console.log('Starting Livereload')
    if (lrRunning) {
      console.log('Livereload already started')
      res.status(400).send()
      return
    }
    console.log('Rewatching files for LiveReload')
    // @ts-ignore
    lrServer.watcher.add(watchDir)
    lrRunning = true
    console.log('Kicking off refresh')
    lrServer.filterRefresh(watchDir[0] + 'index.html')
    res.status(204).send()
  })
}
class AssertionError extends Error {}
class FetchError extends Error {
  status: number = 0
}

export function assert<T>(
  val: T,
  name: string = 'val',
): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError(
      `Expected ${name} to be defined, but received ${val}`,
    )
  }
}

export async function fetcher(
  url: RequestInfo | URL,
  opts: RequestInit,
  fail: boolean = true,
): Promise<Response> {
  console.log(`[FETCH REQ] ${url}`, opts)
  let resp
  try {
    resp = await fetch(url, opts)
    console.log(`[FETCH RESP] ${resp.statusText}`)
  } catch (ex) {
    console.error('[FETCH ERR]', ex)
    throw ex
  }

  if (fail && !resp.ok) {
    let err = new FetchError(
      'An unspecified failure response occurred from API',
    )
    try {
      const txt = await resp.text()
      err = new FetchError('An error response was recieved: ' + txt)
    } catch {}
    err.status = resp.status
    throw err
  }

  return resp
}

export async function fetchjson<T>(
  url: RequestInfo | URL,
  opts: RequestInit,
  fail: boolean = true,
): Promise<T> {
  const resp = await fetcher(url, opts, fail)
  return await resp.json()
}

export async function fetchraw(
  url: RequestInfo | URL,
  opts: RequestInit,
  fail: boolean = true,
): Promise<string> {
  const resp = await fetcher(url, opts, fail)
  return await resp.text()
}
export function strToBool(s: string | number | undefined | null): boolean {
  if (s == undefined || s == null) return false
  if (typeof s === 'number') {
    return s != 0
  }
  s = s.toLowerCase()
  if (!s.length) return false

  if (s.startsWith('f') || s == '0') return false

  return true
}

export function uuid() {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) =>
    (
      parseInt(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c) / 4)))
    ).toString(16),
  )
}

/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:\n    100\nThanks for playing!"
 */
export function stripMargin(template: string[], ...expressions: any[]) {
  let result = template.reduce((accumulator: any, part: any, i: any) => {
    return accumulator + expressions[i - 1] + part
  })
  return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1')
}

/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:    100 Thanks for playing!"
 */
export function joinMargin(template: string[], ...expressions: any[]) {
  let result = template.reduce((accumulator: any, part: any, i: any) => {
    return accumulator + expressions[i - 1] + part
  })
  return result.replace(/(\n|\r|\r\n)\s*\|/g, '  ')
}

export function slugify(str: string, replace = '-') {
  return str
    .toString() // Cast to string (optional)
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, replace) // swap any length of whitespace, underscore, hyphen characters with replace
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

export function unslugify(
  str: string,
  replace: RegExp | string | undefined = undefined,
) {
  if (!replace) {
    replace = /\-/g
  }
  return str
    .replace(replace, ' ')
    .replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
    )
}
export function titleize(str: string, splits = /[\s_-]+/) {
  return str
    .split(splits)
    .map((str) => (str as any).$capitalize())
    .join(' ')
}
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
}

export function throttle(cb: any, delay = 1000) {
  let shouldWait = false
  let waitingArgs: any
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      cb(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args: any[]) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    cb(...args)
    shouldWait = true
    setTimeout(timeoutFunc, delay)
  }
}

export function isJSON(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export function debounce(this: any, func: any, timeout = 300) {
  let timer: any
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

export async function asyncDo({ run, until, then, wait = 50 }: any = {}) {
  // Run function 'run', until function 'until' returns true, call function 'then' on result of run.
  // Ran on a setInterval of default 50ms
  if (!run || !until || !then) {
    throw new Error('Must pass do, until, and then functions to asyncDo')
  }

  return new Promise((res, rej) => {
    const intv = setInterval(() => {
      try {
        const r = run()
        if (until(r)) {
          clearInterval(intv)
          res(then(r, true))
        }
      } catch (ex) {
        clearInterval(intv)
        rej(ex)
      }
    }, wait)
  })
}

export function chunkText(text: string, limit: number): (string | string[])[] {
  const out = []
  const words = text.split(/\s+/)
  let i = 0
  for (; i < words.length / limit; i++) {
    out.push(words.slice(i * limit, i * limit + limit).join(' '))
  }
  const leftover = words.length % limit
  if (leftover > 0) {
    out.push(words.slice(i, i + leftover))
  }
  return out
}

export function randomFromArray(array: any[]): any[] {
  return array[~~(Math.random() * array.length)]
}

export function arrayToObj(obj: any, key: string, hasMultiple = false) {
  const out: any = {}
  for (const o of obj) {
    if (o[key] === undefined) throw new Error(`Key ${key} not found in obj`)

    const k = o[key]
    if (!out[k]) {
      if (hasMultiple) {
        out[k] = [o]
      } else {
        out[k] = o
      }
      continue
    }

    hasMultiple = true
    const cur = out[k]
    if (Array.isArray(cur)) {
      cur.push(o)
      continue
    }

    out[k] = [out[k], o]
  }

  if (hasMultiple) {
    // If there are entries with multiple items, make all child objects
    // into an array so it's homogenous
    for (const k of Object.keys(out)) {
      if (!Array.isArray(out[k])) {
        out[k] = [out[k]]
      }
    }
  }

  return out
}

export function* arrayChunk(arr: any[], size: number): any {
  if (size <= 0) throw new Error('Chunk size must be greater than 0')
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}

export function dateForCurrentTZ(date: string): Date {
  // Date should be in form YYYY-MM-DD
  return new Date(`${date}T00:00:00${getTimezoneOffsetString()}`)
}

export function getTimezoneOffsetString() {
  const padZero = (value: any) => (value < 10 ? `0${value}` : value)
  const offsetMinutes = new Date().getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60))
  const offsetMinutesPart = Math.abs(offsetMinutes % 60)

  const sign = offsetMinutes > 0 ? '-' : '+'

  return `${sign}${padZero(offsetHours)}:${padZero(offsetMinutesPart)}`
}

export function getStartOfDate(date: Date | undefined = undefined) {
  if (!date) date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
export function addDays(days: number, date: Date | undefined = undefined) {
  if (!date) date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
export function addWeeks(weeks: number, date: Date | undefined = undefined) {
  if (!date) date = new Date()
  date.setDate(date.getDate() + 7 * weeks)
  return date
}

export function datetimePretty(time: string | Date, seconds = true) {
  if (typeof time === 'string') {
    time = new Date(time)
  }
  let ret = `${time.toDateString()} ${time.toLocaleTimeString()}`
  if (!seconds) {
    ret = ret.replace(/\:\d\d\ /, '')
  }
  return ret
}

export function dateParts(date: Date | undefined = undefined) {
  if (!date) {
    date = new Date()
  }
  if (typeof date === 'string') {
    date = new Date(date)
  }
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Adding 1 because getMonth() returns a zero-based index
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear().toString()
  const hour = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return [month, day, year, hour, minutes, seconds]
}

export function dateToISODate(date: Date | undefined = undefined): string {
  const [month, day, year] = dateParts(date)
  return `${year}-${month}-${day}`
}

export function dateToISOTime(date: Date | undefined = undefined): string {
  const [month, day, year, hour, minutes, seconds] = dateParts(date)
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
}

export function dateToForeUpAPIDate(
  date: Date | undefined = undefined,
): string {
  const [month, day, year] = dateParts(date)
  return `${month}-${day}-${year}`
}

export function dateToForeUpTime(date: Date | undefined = undefined): string {
  const [month, day, year, hour, minutes, _] = dateParts(date)
  return `${year}-${month}-${day} ${hour}:${minutes}`
}

export function relativeBetweenDates(
  past: Date | string,
  future: Date | string | undefined = undefined,
  includeTime: boolean = false,
): string {
  if (typeof past === 'string') {
    past = new Date(past)
  }
  if (!future) {
    future = new Date()
  }
  if (typeof future === 'string') {
    future = new Date(future)
  }

  const formatter = new Intl.RelativeTimeFormat('en-US', {
    numeric: 'auto',
  })

  const diff = (past as any) - (future as any)
  const seconds = diff / 1000
  if (seconds > -60) {
    return formatter.format(Math.round(seconds), 'seconds')
  }
  const minutes = seconds / 60
  if (minutes > -60) {
    return formatter.format(Math.round(minutes), 'minutes')
  }
  const hours = minutes / 60
  if (hours > -24) {
    return formatter.format(Math.round(hours), 'hours')
  }

  const days = hours / 24
  const d = formatter.format(Math.round(days), 'days')
  if (!includeTime) {
    return d
  }
  return `${d} @ ${past.toLocaleTimeString()}`
}