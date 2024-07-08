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
export function B(opts = { root: null, parser: null }) {
    if (opts.root != null && opts.parser == null) {
        throw new Error('Must pass parser with root doc');
    }
    let root;
    let parser = opts.parser;
    if (typeof opts.root == 'string') {
        root = parser.parse(opts.root);
    }
    else if (opts.root) {
        root = opts.root;
    }
    if (!root) {
        if (isBrowser) {
            root = window.document;
        }
    }
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
        if (parent && parent.hasOwnProperty('__is_b')) {
            return b(parent.el);
        }
        if (!parent) {
            parent = isBrowser
                ? document.body
                : parser.parse('<div id="b-root"></div>');
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
                children = [b.elems['div']({ innerHTML: children })];
            }
            children = !Array.isArray(children) ? [children] : children;
            return children;
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
            $(q) {
                return this.querySelector(q);
            },
            $$(q) {
                return this.querySelectorAll(q);
            },
            querySelector(q) {
                return b(this.el.querySelector(q));
            },
            querySelectorAll(q) {
                return Array.from(this.el.querySelectorAll(q)).map(b);
            },
            buildSelectOptions(...options) {
                return build(({ option }) => options.map((opt) => {
                    if (Array.isArray(opt)) {
                        return option({ value: opt[0] }, opt[1]);
                    }
                    return option({ value: opt }, opt);
                }));
            },
            set(attr) {
                return b.set(parent, attr);
            },
            childB(sel, attr) {
                return b(parent.querySelector(sel), attr);
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
            let attrs = {};
            if (p.length &&
                typeof p[0] === 'object' &&
                !(isBrowser && p[0] instanceof HTMLElement) &&
                !Array.isArray(p[0]) &&
                !(typeof p[0] === 'function') &&
                !(p[0] === null || p[0] === undefined)) {
                attrs = p.shift();
            }
            if (ids.length) {
                for (const id of ids.split(/\s+/)) {
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
            }
            if (p.length &&
                !(isBrowser && p[0] instanceof HTMLElement) &&
                !Array.isArray(p[0]) &&
                !(typeof p[0] === 'function')) {
                attrs.innerHTML = p.shift();
            }
            return b.elem(tag, attrs, ...p);
        };
        elems[tag] = tagFunc;
        b[tag] = tagFunc;
    }
    b.elems = elems;
    b.escape = B.escape;
    b.add = (where, el, ...children) => {
        const toAdd = [];
        for (const c of children) {
            let child = c;
            if (!child)
                continue;
            if (typeof c === 'function') {
                child = c();
            }
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
    b.changeRoot = (root, parser) => {
        b.root = root;
        b.parser = parser;
    };
    b.setAll = (els, attr) => {
        if (typeof els === 'string') {
            els = root.querySelectorAll(els);
        }
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
    b.setObj = (el, k, v) => {
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
                for (const [innerK, innerV] of Object.entries(v)) {
                    if (Array.isArray(innerV)) {
                        el.addEventListener(innerK, innerV[0], innerV[1]);
                        return;
                    }
                    el.addEventListener(innerK, innerV);
                }
                return;
            case k === 'off':
                for (const [innerK, innerV] of Object.entries(v)) {
                    if (Array.isArray(innerV)) {
                        el.removeEventListener(innerK, innerV[0], innerV[1]);
                        continue;
                    }
                    el.removeEventListener(innerK, innerV);
                }
                return;
            case curVal != undefined && curVal != null && typeof curVal === 'object':
                for (const [innerK, innerV] of Object.entries(v)) {
                    if (el.hasOwnProperty(k)) {
                        curVal[innerK] = innerV;
                    }
                }
                return;
        }
    };
    b.set = (el, attr) => {
        if (!attr) {
            return el;
        }
        for (const [key, v] of Object.entries(attr)) {
            const k = key === 'class' ? 'classList' : key;
            const curVal = el?.[k] ?? undefined;
            switch (true) {
                case v === null:
                    el.removeAttribute(k);
                    continue;
                case k === 'classList':
                    b.setAttr(el, k, v);
                    continue;
                case typeof v === 'function':
                    if (k.startsWith('on') && (!curVal || typeof curVal === 'function')) {
                        const event = (e, ...a) => {
                            if (!v.allowProp) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                            return v(e, ...a);
                        };
                        b.setAttr(el, k, event);
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
                    b.setObj(el, k, v);
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
    b.addClasses = (els, cls) => {
        els = getEls(els);
        cls = formatClasses(cls);
        for (const el of els) {
            for (let c of cls) {
                const pred = Array.isArray(c) ? c[1] : true;
                c = Array.isArray(c) ? c[0] : c;
                if (pred) {
                    el.classList.add(c);
                }
            }
        }
        return els.length === 1 ? els[0] : els;
    };
    b.removeClasses = (els, cls) => {
        els = getEls(els);
        cls = formatClasses(cls);
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
                c = Array.isArray(c) ? c[0] : c;
                if (pred) {
                    el.classList.remove(c);
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
        if (!cls)
            return cls;
        if (typeof cls === 'string') {
            cls = cls
                .split(' ')
                .map((x) => x.trim())
                .filter((x) => x != '');
        }
        if (!Array.isArray(cls)) {
            cls = [cls];
        }
        const out = [];
        for (const c of cls) {
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
     * @param {string} els - Elements to toggle, can be string selector, list, or single elem
     * @param {string} cls1 -
     *  The first list of classes. Can be comma-delimited string, array, or
     *  object with pred as value and classname as key
     * @param {string} cls2 - The second list of classes. Can be same as cls1, or pred
     * @param {string} pred - The predicate, can be boolean or function
     */
    b.cls = (els, cls1, cls2, pred) => {
        els = getEls(els);
        if (typeof cls2 === 'function' || typeof cls2 == 'boolean') {
            pred = cls2;
            cls2 = undefined;
        }
        cls1 = formatClasses(cls1);
        cls2 = formatClasses(cls2);
        if (!cls1 || !cls1.length) {
            // if no first class passed, remove all classes
            b.removeClasses(els);
            if (cls2 && cls2.length) {
                // if second classes found with no first classes, add all second
                b.addClasses(els, cls2);
            }
            return;
        }
        const defaultPredicate = !cls2
            ? (el, cls) => !el.classList.contains(cls)
            : true;
        pred = typeof pred === 'boolean' ? pred : defaultPredicate;
        const predIsFunction = typeof pred === 'function';
        for (const el of els) {
            for (const cls of cls1) {
                const c = Array.isArray(cls) ? cls[0] : cls;
                const predVal = predIsFunction ? pred(el, c) : pred;
                b.setClass(el, c, Array.isArray(cls) ? cls[1] : predVal);
            }
            if (!cls2 || !cls2.length)
                continue;
            for (const cls of cls2) {
                const c = Array.isArray(cls) ? cls[0] : cls;
                const predVal = predIsFunction ? pred(el, c) : !pred;
                b.setClass(el, c, Array.isArray(cls) ? cls[1] : predVal);
                continue;
            }
        }
        return els;
    };
    b.root = root;
    b.parser = parser;
    return b;
}
B.isBrowser = isBrowser;
B.escape = (unsafe) => {
    if (typeof unsafe !== 'string')
        return unsafe;
    return unsafe
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};
B.allowProp = (target, propertyKey, descriptor) => {
    descriptor.value.allowProp = true;
};
export default B();
//# sourceMappingURL=b.js.map