export default class Log {
  isdebug: boolean
  name: string
  onerror: any
  constructor(
    isdebug: boolean,
    name: string | undefined = undefined,
    onerror: any | undefined = undefined,
  ) {
    this.isdebug = isdebug
    this.name = name == null || name == undefined ? '' : name
    this.onerror = onerror
  }

  formatMsg(msg: string) {
    if (this.name) {
      msg = `[${this.name}] ${new Date().toISOString()} ${msg}`
    }
    return msg
  }
  info(msg: string, ...args: any[]) {
    info(this.formatMsg(msg), ...args)
  }

  errorThrow(msg: string, ...args: any[]) {
    this.error(msg, ...args)
    if (args.length) {
      throw args[args.length - 1]
    }
    throw new Error(msg)
  }

  error(msg: string, ...args: any[]) {
    if (this.onerror) {
      this.onerror(msg, ...args)
    }
    error(this.formatMsg(msg), ...args)
  }

  fail(msg: string, ...args: any[]) {
    if (this.onerror) {
      this.onerror(msg, ...args)
    }
    fail(this.formatMsg(msg), ...args)
  }

  debug(msg: string, ...args: any[]) {
    debug(this.isdebug, this.formatMsg(msg), ...args)
  }

  clone(name: string) {
    return new Log(this.isdebug, name, this.onerror)
  }
}

const red = '\x1b[31m'
const dim = '\x1b[2m'
const reset = '\x1b[0m'

export function info(msg: string, ...args: any[]) {
  console.log(msg, ...args)
}

export function error(msg: string, ...args: any[]) {
  if (typeof window === 'undefined') {
    console.error(red + msg + reset, ...args)
  } else {
    console.error('%c' + msg, 'color: #FF0000', ...args)
  }
}

export function fail(msg: string, ...args: any[]) {
  const err: any = new Error(msg)
  err.args = args
  error(msg, ...args)
  process.exit(1)
}

export function debug(isdebug: boolean, msg: string, ...args: any[]) {
  if (!isdebug) return
  if (typeof window === 'undefined') {
    console.log(dim + msg + reset, ...args)
  } else {
    console.log('%c' + msg, 'color: #888888', ...args)
  }
}