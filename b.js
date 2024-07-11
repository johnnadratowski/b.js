const EVENTS = [
    'onactivate',
    'onbeforeactivate',
    'onbeforecut',
    'onbeforeeditfocus',
    'onbeforeupdate',
    'onclick',
    'oncontrolselect',
    'oncut',
    'ondeactivate',
    'ondragend',
    'ondragleave',
    'ondragstart',
    'onerrorupdate',
    'onfocus',
    'onfocusout',
    'onkeydown',
    'onkeyup',
    'onmousedown',
    'onmouseleave',
    'onmouseout',
    'onmouseup',
    'onmove',
    'onmovestart',
    'onpropertychange',
    'onresize',
    'onresizestart',
    'ontimeerror',
    'onafterupdate',
    'onbeforecopy',
    'onbeforedeactivate',
    'onbeforepaste',
    'onblur',
    'oncontextmenu',
    'oncopy',
    'ondblclick',
    'ondrag',
    'ondragenter',
    'ondragover',
    'ondrop',
    'onfilterchange',
    'onfocusin',
    'onhelp',
    'onkeypress',
    'onlosecapture',
    'onmouseenter',
    'onmousemove',
    'onmouseover',
    'onmousewheel',
    'onmoveend',
    'onpaste',
    'onreadystatechange',
    'onresizeend',
    'onselectstart',
];
const HTML_TAGS = [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'br',
    'button',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'document',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'head',
    'header',
    'hgroup',
    'hr',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'link',
    'main',
    'map',
    'mark',
    'marquee',
    'marquee',
    'menu',
    'meta',
    'meter',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'select',
    'slot',
    'small',
    'source',
    'span',
    'strong',
    'style',
    'summary',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
];
const isBrowser = typeof window !== 'undefined';
function getRoot(opts) {
    let root;
    if (typeof opts.root == 'string') {
        root = opts.parser.parse(opts.root);
    }
    else if (opts.root) {
        root = opts.root;
    }
    if (!root) {
        if (isBrowser) {
            root = window.document;
        }
    }
    return root;
}
export function B(opts = { root: null, parser: null }) {
    if (opts.root != null && opts.parser == null) {
        throw new Error('Must pass parser with root doc');
    }
    let parser = opts.parser;
    let root = getRoot(opts);
    function createRootElement(tag) {
        const isVoid = root.voidTag && root.voidTag.voidTags && root.voidTag.voidTags.has(tag);
        return parser.parse(isVoid ? `<${tag}/>` : `<${tag}></${tag}>`)
            .childNodes[0];
    }
    function insertAdjacentElement(el, where, child) {
        if (el.insertAdjacentElement) {
            return el.insertAdjacentElement(where, child);
        }
        return el.insertAdjacentHTML(where, child.outerHTML);
    }
    function b(parent, attrs) {
        if (!parent) {
            parent = isBrowser
                ? document.body
                : parser.parse('<div id="b-root"></div>');
        }
        if (B.is_b(parent)) {
            return b(parent.el);
        }
        if (typeof parent === 'string') {
            parent = root.querySelector(parent);
        }
        if (!parent) {
            throw new Error(`Could not find el for b`, parent);
        }
        function getChildren(cb) {
            let children = typeof cb === 'function' ? cb(b.elems) : cb;
            if (children == null || children == undefined) {
                children = [];
            }
            if (typeof children === 'string') {
                children = Array.from(b.elems['div']({ innerHTML: children }).children());
            }
            return !Array.isArray(children) ? [children] : children;
        }
        function build(...p) {
            let where = 'beforeend';
            if (typeof p[0] === 'string') {
                where = p.shift();
            }
            let cb = p[0];
            let default_ = p.length > 1 ? p[1] : null;
            let children = getChildren(cb);
            if (!children.length && default_) {
                children = getChildren(default_);
            }
            if (where === 'replace') {
                if (children && children.length) {
                    parent.innerHTML = '';
                }
                where = 'beforeend';
            }
            return {
                children: b.add(where, parent, ...children),
                el: parent,
                after: (cb) => {
                    return cb(...children);
                },
                removeChildren: () => children.forEach((c) => c.remove()),
            };
        }
        if (typeof attrs === 'string') {
            attrs = { innerHTML: attrs };
        }
        b.set(parent, attrs);
        const ret = {
            __is_b: true,
            el: parent,
            build,
            root,
            $(q, attr) {
                return this.querySelector(q, attr);
            },
            $$(q, attr) {
                return this.querySelectorAll(q, attr);
            },
            querySelector(q, attr) {
                return b(this.el.querySelector(q), attr);
            },
            querySelectorAll(q, attr) {
                return Array.from(this.el.querySelectorAll(q)).map((q) => b(q, attr));
            },
            buildSelectOptions(...options) {
                build(({ option }) => options.map((opt) => {
                    if (Array.isArray(opt)) {
                        return option({ value: opt[0] }, opt[1]);
                    }
                    return option({ value: opt }, opt);
                }));
                return this;
            },
            set(attr) {
                return b.set(parent, attr);
            },
            childB(sel, attr) {
                return b(parent.querySelector(sel), attr);
            },
            hasCls(...cls) {
                return b.hasCls(parent, ...cls);
            },
            cls(cls1, cls2, pred) {
                b.cls(parent, cls1, cls2, pred);
                return this;
            },
            removeClasses(cls) {
                b.removeClasses(parent, cls);
                return this;
            },
            addClasses(cls) {
                b.addClasses(parent, cls);
                return this;
            },
            on(type, listener, options) {
                b.on(parent, type, listener, options, this);
                return this;
            },
            off(type) {
                b.off(parent, type);
                return this;
            },
        };
        return new Proxy(ret, {
            get: (target, prop) => {
                if (target.hasOwnProperty(prop)) {
                    return target[prop];
                }
                const ret = target.el[prop];
                if (typeof ret === 'function') {
                    return ret.bind(target.el);
                }
                return ret;
            },
            set: (target, prop, value) => {
                if (target.hasOwnProperty(prop)) {
                    target[prop] = value;
                }
                else {
                    target.el[prop] = value;
                }
                return true;
            },
        });
    }
    const elems = {};
    for (const tag of HTML_TAGS) {
        const tagFunc = (...p) => {
            if (!p.length) {
                return b.elem(tag);
            }
            let ids = '';
            if (typeof p[0] === 'string') {
                ids = p.shift();
            }
            const isAttrs = p.length &&
                p[0] !== null &&
                p[0] !== undefined &&
                !(isBrowser && p[0] instanceof HTMLElement) &&
                !Array.isArray(p[0]) &&
                !(OB.is_ob(p[0]) && typeof p[0].value !== 'object') &&
                typeof p[0] === 'object';
            let attrs = {};
            if (isAttrs) {
                attrs = p.shift();
            }
            if (ids.length) {
                attrs = B.setClsString(OB.is_ob(attrs) ? attrs.value : attrs, ids);
            }
            const isInnerHTML = p.length &&
                p[0] !== null &&
                p[0] !== undefined &&
                (typeof p[0] === 'string' ||
                    (OB.is_ob(p[0]) && typeof p[0].value === 'string'));
            if (isInnerHTML) {
                attrs.innerHTML = p.shift();
            }
            return b.elem(tag, attrs, ...p);
        };
        elems[tag] = tagFunc;
        b[tag] = tagFunc;
    }
    b.elems = elems;
    b.escape = B.escapeHTML;
    b.add = (where, el, ...children) => {
        const toAdd = [];
        for (const c of children) {
            if (!c)
                continue;
            let child = typeof c === 'function' ? c() : c;
            if (!child)
                continue;
            if (Array.isArray(child)) {
                toAdd.push(...child.filter((x) => x !== null && x !== undefined));
            }
            else {
                toAdd.push(child);
            }
        }
        if (toAdd.length) {
            for (const c of toAdd) {
                insertAdjacentElement(el, where, c);
            }
        }
        return toAdd;
    };
    b.changeRoot = (newRoot, newParser) => {
        root = newRoot;
        parser = newParser;
        b.root = b(root);
        b.document = b.root;
        if (b.document.body) {
            b.body = b(b.document.body);
        }
    };
    b.setAll = (elsSpec, attr) => {
        const els = typeof elsSpec === 'string' ? root.querySelectorAll(elsSpec) : elsSpec;
        if (!els || !els.length) {
            throw new Error(`Could not find els for setall`, els);
        }
        for (const el of els) {
            b.set(el, attr);
        }
    };
    b.setAttr = (el, k, v) => {
        if (k === 'class' || k === 'classList') {
            b.cls(el, v, true);
            return;
        }
        if (parser) {
            if (typeof v === 'function')
                return;
            if (k in el && k != 'id') {
                el[k] = v;
            }
            else {
                el.setAttribute(k, v);
            }
            return;
        }
        el[k] = v;
    };
    b.setObj = (el, k, v, bind_to) => {
        const curVal = el?.[k] ?? undefined;
        switch (true) {
            case parser && k === 'style':
                const style = Object.entries(v)
                    .map(([k, v]) => {
                    k = k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
                    return `${k}:${v}`;
                })
                    .join(';');
                b.setAttr(el, k, style);
            case k === 'on':
                for (let [innerK, innerV] of Object.entries(v)) {
                    if (innerK in EVENTS) {
                        innerK = innerK.substring(2);
                    }
                    if (Array.isArray(innerV)) {
                        b.on(el, innerK, innerV[0], innerV[1], bind_to);
                        continue;
                    }
                    b.on(el, innerK, innerV, null, bind_to);
                }
                return;
            case k === 'off':
                for (let [innerK, innerV] of Object.entries(v)) {
                    if (innerK in EVENTS) {
                        innerK = innerK.substring(2);
                    }
                    if (Array.isArray(innerV)) {
                        b.off(el, innerK);
                        continue;
                    }
                    b.off(el, innerK);
                }
                return;
            case curVal != undefined && curVal != null && typeof curVal === 'object':
                for (const [innerK, innerV] of Object.entries(v)) {
                    if (innerK in curVal) {
                        curVal[innerK] = innerV;
                    }
                }
                return;
        }
    };
    b.on = (elsSpec, type, listener, options, bind_to) => {
        const els = getEls(elsSpec);
        for (const el of els) {
            const event = (e, ...a) => {
                if (!listener.allowProp) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const ret = listener.call(bind_to || el, e, ...a);
                if (ret === 'off') {
                    b.off(el, type, listener);
                }
                return ret;
            };
            el.addEventListener(type, event, options);
            const anyEl = el;
            if (typeof anyEl.__events === 'undefined') {
                anyEl.__events = {};
            }
            if (typeof anyEl.__events[type] === 'undefined') {
                anyEl.__events[type] = [];
            }
            anyEl.__events[type].push([event, options, listener]);
        }
    };
    b.off = (elsSpec, type, listener) => {
        const els = getEls(elsSpec);
        for (const el of els) {
            const anyEl = el;
            const toRemove = anyEl?.__events?.[type] ?? [];
            toRemove
                .filter((remove) => !listener || remove[2] == listener)
                .forEach((remove) => {
                el.removeEventListener(type, remove[0], remove[1]);
            });
        }
    };
    b.set = (el, attr) => {
        if (!attr) {
            return el;
        }
        if (OB.is_ob(attr)) {
            attr = attr.use((newAttr) => {
                b.set(el, newAttr);
            });
        }
        for (const [key, value] of Object.entries(attr)) {
            const k = key === 'class' ? 'classList' : key;
            const curVal = el?.[k] ?? undefined;
            let v = value;
            if (OB.is_ob(value)) {
                v = value.use((newV) => {
                    b.set(el, { [k]: newV });
                });
            }
            switch (true) {
                case v === null:
                    el.removeAttribute(k);
                    continue;
                case k === 'classList':
                    b.setAttr(el, k, v);
                    continue;
                case typeof v === 'function':
                    if (k.toLowerCase() in EVENTS &&
                        (!curVal || typeof curVal === 'function')) {
                        b.on(el, k.substring(2), v, attr);
                        continue;
                    }
                    b.setAttr(el, k, v);
                    continue;
                case Array.isArray(v):
                    if (Array.isArray(curVal)) {
                        b.setAttr(el, k, v);
                        continue;
                    }
                    b.setAttr(el, k, v.join(' '));
                    continue;
                case Array.isArray(curVal) && typeof v === 'string':
                    b.setAttr(el, k, v.split(','));
                    continue;
                case typeof v === 'object':
                    b.setObj(el, k, v, attr);
                    continue;
            }
            b.setAttr(el, k, v);
        }
        return el;
    };
    b.elem = (tag, attr = {}, ...child) => {
        const el = root.createElement
            ? root.createElement(tag)
            : createRootElement(tag);
        b.set(el, attr);
        b.add('beforeend', el, ...child);
        return el;
    };
    b.hasCls = (elsSpec, ...cls) => {
        const els = getEls(elsSpec);
        if (!els.length)
            return false;
        for (const el of els) {
            for (const c of cls) {
                if (!el.classList.contains(c))
                    return false;
            }
        }
        return true;
    };
    b.addClasses = (elsSpec, clsSpec) => {
        const els = getEls(elsSpec);
        const cls = formatClasses(clsSpec);
        if (!cls)
            return;
        for (const el of els) {
            for (let c of cls) {
                const pred = Array.isArray(c) ? c[1] : true;
                const cCls = Array.isArray(c) ? c[0] : c;
                if (pred) {
                    el.classList.add(cCls);
                }
            }
        }
        return els.length === 1 ? els[0] : els;
    };
    b.removeClasses = (elsList, clsSpec) => {
        const els = getEls(elsList);
        const cls = formatClasses(clsSpec);
        els.forEach((el) => {
            if (!cls) {
                if (el.className) {
                    el.className = '';
                }
                else {
                    Array.from(el.classList).forEach((c) => el.classList.remove(c));
                }
                return;
            }
            for (let c of cls) {
                const pred = Array.isArray(c) ? c[1] : true;
                const cCls = Array.isArray(c) ? c[0] : c;
                if (pred) {
                    el.classList.remove(cCls);
                }
            }
        });
        return els.length === 1 ? els[0] : els;
    };
    function getEls(els) {
        if (typeof els === 'string') {
            els = Array.from(root.querySelectorAll(els));
        }
        if (!Array.isArray(els)) {
            els = [els];
        }
        return els;
    }
    function formatClasses(cls) {
        if (cls === null || cls === undefined)
            return cls;
        if (typeof cls === 'string') {
            cls = B.splitClsString(cls);
        }
        const clsArray = !Array.isArray(cls) ? [cls] : cls;
        const out = [];
        for (const c of clsArray) {
            if (typeof c !== 'object') {
                out.push(c);
                continue;
            }
            for (const k of Object.keys(c)) {
                out.push([k, c[k]]);
            }
        }
        return out;
    }
    b.setClass = (el, cls, doSet) => {
        if (doSet) {
            if (!el.classList.contains(cls)) {
                el.classList.add(cls);
            }
        }
        else {
            el.classList.remove(cls);
        }
        return el;
    };
    /**
     * Toggle classes
     *
     * If only passing cls1, will toggle all classes on and off.
     * If passing no cls1, and a cls2, will remove all classes, then add all from cls2
     * If passing cls1, and a cls2, will add all classes from cls1 and remove all from cls2
     * If passing cls1, and a cls2, will toggle all classes in both lists
     * If passing cls1, and a pred (can pass pred into cls2) then all classes either added/removed based on pred
     * If passing cls1, and cls2, and a pred will use opposite pred for cls2
     *
     * If predicate is function, it's not used as opposite pred for last case
     *
     * @param {string} elsSpec - Elements to toggle, can be string selector, list, or single elem
     * @param {string} cls1Spec -
     *  The first list of classes. Can be comma-delimited string, array, or
     *  object with pred as value and classname as key
     * @param {string} cls2Spec - The second list of classes. Can be same as cls1, or pred
     * @param {string} pred - The predicate, can be boolean or function
     */
    b.cls = (elsSpec, cls1Spec, cls2Spec, pred) => {
        const els = getEls(elsSpec);
        if (typeof cls2Spec === 'function' || typeof cls2Spec == 'boolean') {
            pred = cls2Spec;
            cls2Spec = undefined;
        }
        const cls1 = formatClasses(cls1Spec);
        const cls2 = formatClasses(cls2Spec);
        if (!cls1 || !cls1.length) {
            // if no first class passed, remove all classes
            b.removeClasses(els);
            if (cls2 && cls2.length) {
                // if second classes found with no first classes, add all second
                b.addClasses(els, cls2Spec);
            }
            return;
        }
        const defaultPredicate = !cls2
            ? (el, cls) => !el.classList.contains(cls)
            : true;
        pred = typeof pred === 'boolean' ? pred : defaultPredicate;
        for (const el of els) {
            for (const cls of cls1) {
                const c = Array.isArray(cls) ? cls[0] : cls;
                const predVal = typeof pred === 'function' ? pred(el, c) : pred;
                const finPredVal = Array.isArray(cls) ? cls[1] : predVal;
                b.setClass(el, c, finPredVal);
            }
            if (!cls2 || !cls2.length)
                continue;
            for (const cls of cls2) {
                const c = Array.isArray(cls) ? cls[0] : cls;
                const predVal = typeof pred === 'function' ? pred(el, c) : !pred;
                const finPredVal = Array.isArray(cls) ? cls[1] : predVal;
                b.setClass(el, c, finPredVal);
                continue;
            }
        }
        return els;
    };
    b.B = B;
    b.ob = B.ob;
    b.isBrowser = B.isBrowser;
    b.escapeHTML = B.escapeHTML;
    b.splitClsString = B.splitClsString;
    b.setClsString = B.setClsString;
    b.debounce = B.debounce;
    b.throttle = B.throttle;
    b.allowProp = B.allowProp;
    b.slugify = B.slugify;
    b.unslugify = B.unslugify;
    b.stripMargin = B.stripMargin;
    b.joinMargin = B.joinMargin;
    b.titleize = B.titleize;
    b.capitalize = B.capitalize;
    b.uuid = B.uuid;
    b.validateEmail = B.validateEmail;
    b.isJSON = B.isJSON;
    b.strToBool = B.strToBool;
    b.assert = B.assert;
    b.asyncUntil = B.asyncUntil;
    b.arrayToObj = B.arrayToObj;
    b.recurseVar = B.recurseVar;
    b.arrayChunk = B.arrayChunk;
    b.root = b(root);
    b.document = b.root;
    b.parser = parser;
    if (b.document.body) {
        b.body = b(b.document.body);
    }
    return b;
}
class OB {
    __is_ob = true;
    _value = null;
    using = [];
    cb;
    children = [];
    constructor(value, cb) {
        this._value = value;
        this.cb = cb;
    }
    static is_ob(v) {
        return v && v.hasOwnProperty('__is_ob') ? v : null;
    }
    static replace_ob(v, cb) {
        const obs = [];
        B.recurseVar(v, (item, k, ...parentMeta) => {
            let ob;
            if (!parent || !k || !(ob = OB.is_ob(item))) {
                return false;
            }
            parent[k] = cb(ob);
            obs.push(ob);
            return false;
        });
        return obs;
    }
    static getValue(ob, v) {
        if (!ob.cb)
            return v;
        if (typeof ob.cb === 'function') {
            return ob.cb(v);
        }
        else if (typeof ob.cb === 'string') {
            return ob.cb.replace('${}', v ? v.toString() : '');
        }
        else {
            throw new Error(`Unexpected type for observable transform: ${typeof ob.cb}`);
        }
    }
    get value() {
        return OB.getValue(this, this._value);
    }
    set value(newV) {
        const oldV = this.value;
        this._value = OB.getValue(this, newV);
        for (const use of this.using) {
            use(this._value, oldV);
        }
        for (const child of this.children) {
            child.value = newV;
        }
    }
    as(cb) {
        const child = new OB(this.value, cb);
        this.children.push(child);
        return child;
    }
    use(cb) {
        this.using.push(cb);
        return this.value;
    }
}
B.ob = (v) => {
    return new OB(v);
};
B.is_b = (is_b) => {
    return is_b && is_b.hasOwnProperty('__is_b');
};
B.isBrowser = isBrowser;
B.escapeHTML = (unsafe) => {
    if (typeof unsafe !== 'string')
        return unsafe;
    return unsafe
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};
B.splitClsString = (cls) => {
    return cls
        .split(/[\s,]+/)
        .map((x) => x.trim())
        .filter((x) => x != '');
};
B.setClsString = (attrs, ids) => {
    for (const id of B.splitClsString(ids)) {
        if (id.startsWith('#')) {
            if (attrs.id) {
                throw new Error(`Object already has an ID ${attrs.id}.  Tried to set to ${id}`);
            }
            attrs.id = id.substring(1);
            continue;
        }
        if (id.startsWith('.')) {
            if (attrs.class === null || attrs.class === undefined) {
                attrs.class = '';
            }
            attrs.class += ` ${id.substring(1)}`;
        }
    }
    return attrs;
};
B.debounce = (func, timeout = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
};
B.throttle = (cb, delay = 1000) => {
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
};
B.allowProp = (func) => {
    func.allowProp = true;
    return func;
};
B.slugify = (str, replace = '-') => {
    return str
        .toString() // Cast to string (optional)
        .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase() // Convert the string to lowercase letters
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
        .replace(/[\s_-]+/g, replace) // swap any length of whitespace, underscore, hyphen characters with replace
        .replace(/^-+|-+$/g, ''); // remove leading, trailing -
};
B.unslugify = (str, replace = undefined) => {
    if (!replace) {
        replace = /\-/g;
    }
    return str
        .replace(replace, ' ')
        .replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
};
/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:\n    100\nThanks for playing!"
 */
B.stripMargin = (template, ...expressions) => {
    let result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });
    return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
};
/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:    100 Thanks for playing!"
 */
B.joinMargin = (template, ...expressions) => {
    let result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });
    return result.replace(/(\n|\r|\r\n)\s*\|/g, '  ');
};
B.titleize = (str, splits = /[\s_-]+/) => {
    return str
        .split(splits)
        .map((str) => str.$capitalize())
        .join(' ');
};
B.capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
B.uuid = () => {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) => (parseInt(c) ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c) / 4)))).toString(16));
};
B.validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
B.isJSON = (str) => {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
};
B.strToBool = (s) => {
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
};
class AssertionError extends Error {
}
B.assert = (val, name = 'val') => {
    if (val === undefined || val === null) {
        throw new AssertionError(`Expected ${name} to be defined, but received ${val}`);
    }
};
B.asyncUntil = ({ run, until, then, wait = 50 } = {}) => {
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
};
B.arrayToObj = (obj, key, hasMultiple = false) => {
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
};
B.recurseVar = (var_, cb, key, ...parent) => {
    if (Array.isArray(var_)) {
        if (cb(var_, key, ...parent)) {
            return;
        }
        for (const i in var_) {
            B.recurseVar(var_[i], cb, i, [key, var_], ...parent);
        }
        return;
    }
    if (typeof var_ === 'object') {
        if (cb(var_, key, ...parent)) {
            return;
        }
        for (const k of Object.keys(var_)) {
            B.recurseVar(var_[k], cb, k, [key, var_], ...parent);
        }
    }
    if (cb(var_, key)) {
        return;
    }
};
export function* arrayChunk(arr, size) {
    if (size <= 0)
        throw new Error('Chunk size must be greater than 0');
    for (let i = 0; i < arr.length; i += size) {
        yield arr.slice(i, i + size);
    }
}
B.arrayChunk = arrayChunk;
export default B();
//# sourceMappingURL=b.js.map