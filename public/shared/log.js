export default class Log {
    isdebug;
    name;
    onerror;
    constructor(isdebug, name = undefined, onerror = undefined) {
        this.isdebug = isdebug;
        this.name = name == null || name == undefined ? '' : name;
        this.onerror = onerror;
    }
    formatMsg(msg) {
        if (this.name) {
            msg = `[${this.name}] ${new Date().toISOString()} ${msg}`;
        }
        return msg;
    }
    info(msg, ...args) {
        info(this.formatMsg(msg), ...args);
    }
    errorThrow(msg, ...args) {
        this.error(msg, ...args);
        if (args.length) {
            throw args[args.length - 1];
        }
        throw new Error(msg);
    }
    error(msg, ...args) {
        if (this.onerror) {
            this.onerror(msg, ...args);
        }
        error(this.formatMsg(msg), ...args);
    }
    fail(msg, ...args) {
        if (this.onerror) {
            this.onerror(msg, ...args);
        }
        fail(this.formatMsg(msg), ...args);
    }
    debug(msg, ...args) {
        debug(this.isdebug, this.formatMsg(msg), ...args);
    }
    clone(name) {
        return new Log(this.isdebug, name, this.onerror);
    }
}
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';
export function info(msg, ...args) {
    console.log(msg, ...args);
}
export function error(msg, ...args) {
    if (typeof window === 'undefined') {
        console.error(red + msg + reset, ...args);
    }
    else {
        console.error('%c' + msg, 'color: #FF0000', ...args);
    }
}
export function fail(msg, ...args) {
    const err = new Error(msg);
    err.args = args;
    error(msg, ...args);
    process.exit(1);
}
export function debug(isdebug, msg, ...args) {
    if (!isdebug)
        return;
    if (typeof window === 'undefined') {
        console.log(dim + msg + reset, ...args);
    }
    else {
        console.log('%c' + msg, 'color: #888888', ...args);
    }
}
//# sourceMappingURL=log.js.map