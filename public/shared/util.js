export function strToBool(s) {
    if (s == undefined || s == null)
        return false;
    if (typeof s === 'number') {
        return s != 0;
    }
    s = s.toLowerCase();
    if (!s.length)
        return false;
    if (s.startsWith('f') || s == '0')
        return false;
    return true;
}
export function uuid() {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) => (parseInt(c) ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c) / 4)))).toString(16));
}
/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:\n    100\nThanks for playing!"
 */
export function stripMargin(template, ...expressions) {
    let result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });
    return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}
/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:    100 Thanks for playing!"
 */
export function joinMargin(template, ...expressions) {
    let result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });
    return result.replace(/(\n|\r|\r\n)\s*\|/g, '  ');
}
export function slugify(str, replace = '-') {
    return str
        .toString() // Cast to string (optional)
        .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase() // Convert the string to lowercase letters
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
        .replace(/[\s_-]+/g, replace) // swap any length of whitespace, underscore, hyphen characters with replace
        .replace(/^-+|-+$/g, ''); // remove leading, trailing -
}
export function unslugify(str, replace = undefined) {
    if (!replace) {
        replace = /\-/g;
    }
    return str
        .replace(replace, ' ')
        .replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
}
export function titleize(str, splits = /[\s_-]+/) {
    return str
        .split(splits)
        .map((str) => str.$capitalize())
        .join(' ');
}
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
export function throttle(cb, delay = 1000) {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
        if (waitingArgs == null) {
            shouldWait = false;
        }
        else {
            cb(...waitingArgs);
            waitingArgs = null;
            setTimeout(timeoutFunc, delay);
        }
    };
    return (...args) => {
        if (shouldWait) {
            waitingArgs = args;
            return;
        }
        cb(...args);
        shouldWait = true;
        setTimeout(timeoutFunc, delay);
    };
}
export function isJSON(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}
export function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}
export async function asyncDo({ run, until, then, wait = 50 } = {}) {
    // Run function 'run', until function 'until' returns true, call function 'then' on result of run.
    // Ran on a setInterval of default 50ms
    if (!run || !until || !then) {
        throw new Error('Must pass do, until, and then functions to asyncDo');
    }
    return new Promise((res, rej) => {
        const intv = setInterval(() => {
            try {
                const r = run();
                if (until(r)) {
                    clearInterval(intv);
                    res(then(r, true));
                }
            }
            catch (ex) {
                clearInterval(intv);
                rej(ex);
            }
        }, wait);
    });
}
export function chunkText(text, limit) {
    const out = [];
    const words = text.split(/\s+/);
    let i = 0;
    for (; i < words.length / limit; i++) {
        out.push(words.slice(i * limit, i * limit + limit).join(' '));
    }
    const leftover = words.length % limit;
    if (leftover > 0) {
        out.push(words.slice(i, i + leftover));
    }
    return out;
}
export function randomFromArray(array) {
    return array[~~(Math.random() * array.length)];
}
export function arrayToObj(obj, key, hasMultiple = false) {
    const out = {};
    for (const o of obj) {
        if (o[key] === undefined)
            throw new Error(`Key ${key} not found in obj`);
        const k = o[key];
        if (!out[k]) {
            if (hasMultiple) {
                out[k] = [o];
            }
            else {
                out[k] = o;
            }
            continue;
        }
        hasMultiple = true;
        const cur = out[k];
        if (Array.isArray(cur)) {
            cur.push(o);
            continue;
        }
        out[k] = [out[k], o];
    }
    if (hasMultiple) {
        // If there are entries with multiple items, make all child objects
        // into an array so it's homogenous
        for (const k of Object.keys(out)) {
            if (!Array.isArray(out[k])) {
                out[k] = [out[k]];
            }
        }
    }
    return out;
}
export function* arrayChunk(arr, size) {
    if (size <= 0)
        throw new Error('Chunk size must be greater than 0');
    for (let i = 0; i < arr.length; i += size) {
        yield arr.slice(i, i + size);
    }
}
export function dateForCurrentTZ(date) {
    // Date should be in form YYYY-MM-DD
    return new Date(`${date}T00:00:00${getTimezoneOffsetString()}`);
}
export function getTimezoneOffsetString() {
    const padZero = (value) => (value < 10 ? `0${value}` : value);
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
    const offsetMinutesPart = Math.abs(offsetMinutes % 60);
    const sign = offsetMinutes > 0 ? '-' : '+';
    return `${sign}${padZero(offsetHours)}:${padZero(offsetMinutesPart)}`;
}
export function getStartOfDate(date = undefined) {
    if (!date)
        date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}
export function addDays(days, date = undefined) {
    if (!date)
        date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}
export function addWeeks(weeks, date = undefined) {
    if (!date)
        date = new Date();
    date.setDate(date.getDate() + 7 * weeks);
    return date;
}
export function datetimePretty(time, seconds = true) {
    if (typeof time === 'string') {
        time = new Date(time);
    }
    let ret = `${time.toDateString()} ${time.toLocaleTimeString()}`;
    if (!seconds) {
        ret = ret.replace(/\:\d\d\ /, '');
    }
    return ret;
}
export function dateParts(date = undefined) {
    if (!date) {
        date = new Date();
    }
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because getMonth() returns a zero-based index
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return [month, day, year, hour, minutes, seconds];
}
export function dateToISODate(date = undefined) {
    const [month, day, year] = dateParts(date);
    return `${year}-${month}-${day}`;
}
export function dateToISOTime(date = undefined) {
    const [month, day, year, hour, minutes, seconds] = dateParts(date);
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}
export function dateToForeUpAPIDate(date = undefined) {
    const [month, day, year] = dateParts(date);
    return `${month}-${day}-${year}`;
}
export function dateToForeUpTime(date = undefined) {
    const [month, day, year, hour, minutes, _] = dateParts(date);
    return `${year}-${month}-${day} ${hour}:${minutes}`;
}
export function relativeBetweenDates(past, future = undefined, includeTime = false) {
    if (typeof past === 'string') {
        past = new Date(past);
    }
    if (!future) {
        future = new Date();
    }
    if (typeof future === 'string') {
        future = new Date(future);
    }
    const formatter = new Intl.RelativeTimeFormat('en-US', {
        numeric: 'auto',
    });
    const diff = past - future;
    const seconds = diff / 1000;
    if (seconds > -60) {
        return formatter.format(Math.round(seconds), 'seconds');
    }
    const minutes = seconds / 60;
    if (minutes > -60) {
        return formatter.format(Math.round(minutes), 'minutes');
    }
    const hours = minutes / 60;
    if (hours > -24) {
        return formatter.format(Math.round(hours), 'hours');
    }
    const days = hours / 24;
    const d = formatter.format(Math.round(days), 'days');
    if (!includeTime) {
        return d;
    }
    return `${d} @ ${past.toLocaleTimeString()}`;
}
//# sourceMappingURL=util.js.map