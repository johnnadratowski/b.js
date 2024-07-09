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
]

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
]

type None = undefined | null
type PredicateFunc = (el: HTMLElement, c: string) => boolean
type ElemListSpec = string | HTMLElement[]
type ElemSpec = string | HTMLElement[] | HTMLElement
type ClassSpec =
  | string
  | string[]
  | { [key: string]: boolean | PredicateFunc }
  | None
type ClassFormatted =
  | (
      | string
      | (string | boolean | ((el: HTMLElement, c: string) => boolean))[]
    )[]
  | None
type Predicate = boolean | PredicateFunc

const isBrowser = typeof window !== 'undefined'

export function B(opts = { root: null, parser: null }): any {
  if (opts.root != null && opts.parser == null) {
    throw new Error('Must pass parser with root doc')
  }
  let root: any
  let parser: any = opts.parser
  if (typeof opts.root == 'string') {
    root = parser.parse(opts.root)
  } else if (opts.root) {
    root = opts.root
  }

  if (!root) {
    if (isBrowser) {
      root = window.document
    }
  }

  function createRootElement(tag: string) {
    const isVoid =
      root.voidTag && root.voidTag.voidTags && root.voidTag.voidTags.has(tag)
    return parser.parse(isVoid ? `<${tag}/>` : `<${tag}></${tag}>`)
      .childNodes[0]
  }

  function insertAdjacentElement(
    el: HTMLElement,
    where: InsertPosition,
    child: HTMLElement,
  ) {
    if (el.insertAdjacentElement) {
      return el.insertAdjacentElement(where, child)
    }
    return el.insertAdjacentHTML(where, child.outerHTML)
  }

  function b(parent: any, attrs?: any): any {
    if (parent && parent.hasOwnProperty('__is_b')) {
      return b(parent.el)
    }
    if (!parent) {
      parent = isBrowser
        ? document.body
        : parser.parse('<div id="b-root"></div>')
    }

    if (typeof parent === 'string') {
      parent = root.querySelector(parent)
    }
    if (!parent) {
      throw new Error(`Could not find el for b`, parent)
    }

    function getChildren(cb: any) {
      let children = typeof cb === 'function' ? cb(b.elems) : cb
      if (children == null || children == undefined) {
        children = []
      }
      if (typeof children === 'string') {
        children = [b.elems['div']({ innerHTML: children })]
      }
      children = !Array.isArray(children) ? [children] : children
      return children
    }

    function build(...p: any) {
      let where = 'beforeend'
      if (typeof p[0] === 'string') {
        where = p.shift()
      }

      let cb = p[0]
      let default_ = p.length > 1 ? p[1] : null

      let children = getChildren(cb)
      if (!children.length && default_) {
        children = getChildren(default_)
      }

      if (where === 'replace') {
        if (children && children.length) {
          parent.innerHTML = ''
        }
        where = 'beforeend'
      }

      return {
        children: b.add(where as InsertPosition, parent, ...children),
        el: parent,
        after: (cb: any) => {
          return cb(...children)
        },
        removeChildren: () => children.forEach((c: HTMLElement) => c.remove()),
      }
    }

    if (typeof attrs === 'string') {
      attrs = { innerHTML: attrs }
    }
    b.set(parent, attrs)

    const ret = {
      __is_b: true,
      el: parent,
      build,
      root,
      $(q: string) {
        return this.querySelector(q)
      },
      $$(q: string) {
        return this.querySelectorAll(q)
      },
      querySelector(q: string) {
        return b(this.el.querySelector(q))
      },
      querySelectorAll(q: string) {
        return Array.from(this.el.querySelectorAll(q)).map(b)
      },
      buildSelectOptions(...options: any) {
        build(({ option }: any) =>
          options.map((opt: any) => {
            if (Array.isArray(opt)) {
              return option({ value: opt[0] }, opt[1])
            }
            return option({ value: opt }, opt)
          }),
        )
        return this
      },
      set(attr: any) {
        return b.set(parent, attr)
      },
      childB(sel: any, attr: any) {
        return b(parent.querySelector(sel), attr)
      },
      hasCls(...cls: string[]): boolean {
        return b.hasCls(parent, ...cls)
      },
      cls(cls1: any, cls2: any, pred: any) {
        b.cls(parent, cls1, cls2, pred)
        return this
      },
      removeClasses(cls: any) {
        b.removeClasses(parent, cls)
        return this
      },
      addClasses(cls: any) {
        b.addClasses(parent, cls)
        return this
      },
      on(type: string, listener: any, options?: any) {
        b.on(parent, type, listener, options, this)
        return this
      },
      off(type: string) {
        b.off(parent, type)
        return this
      },
    }

    return new Proxy(ret, {
      get: (target: any, prop: any) => {
        if (target.hasOwnProperty(prop)) {
          return target[prop]
        }
        const ret = target.el[prop]
        if (typeof ret === 'function') {
          return ret.bind(target.el)
        }
        return ret
      },
      set: (target: any, prop: any, value: any) => {
        if (target.hasOwnProperty(prop)) {
          target[prop] = value
        } else {
          target.el[prop] = value
        }
        return true
      },
    })
  }

  const elems: any = {}

  for (const tag of HTML_TAGS) {
    const tagFunc = (...p: any) => {
      if (!p.length) {
        return b.elem(tag)
      }
      let ids = ''
      if (typeof p[0] === 'string') {
        ids = p.shift()
      }
      let attrs: any = {}
      if (
        p.length &&
        typeof p[0] === 'object' &&
        !(isBrowser && p[0] instanceof HTMLElement) &&
        !Array.isArray(p[0]) &&
        !(typeof p[0] === 'function') &&
        !(p[0] === null || p[0] === undefined)
      ) {
        attrs = p.shift()
      }
      if (ids.length) {
        for (const id of ids.split(/\s+/)) {
          if (id.startsWith('#')) {
            if (attrs.id) {
              throw new Error(
                `Object already has an ID ${attrs.id}.  Tried to set to ${id}`,
              )
            }
            attrs.id = id.substring(1)
            continue
          }

          if (id.startsWith('.')) {
            if (attrs.class === null || attrs.class === undefined) {
              attrs.class = ''
            }
            attrs.class += ` ${id.substring(1)}`
          }
        }
      }
      if (
        p.length &&
        !(isBrowser && p[0] instanceof HTMLElement) &&
        !Array.isArray(p[0]) &&
        !(typeof p[0] === 'function')
      ) {
        attrs.innerHTML = p.shift()
      }
      return b.elem(tag, attrs, ...p)
    }
    elems[tag as keyof typeof elems] = tagFunc
    b[tag as keyof typeof b] = tagFunc
  }

  b.elems = elems

  b.escape = B.escape

  b.add = (
    where: InsertPosition,
    el: HTMLElement,
    ...children: (HTMLElement | (() => HTMLElement))[]
  ) => {
    const toAdd = []
    for (const c of children) {
      if (!c) continue

      let child = typeof c === 'function' ? c() : c
      if (!child) continue

      if (Array.isArray(child)) {
        toAdd.push(...child.filter((x) => x !== null && x !== undefined))
      } else {
        toAdd.push(child)
      }
    }

    if (toAdd.length) {
      for (const c of toAdd) {
        insertAdjacentElement(el, where, c)
      }
    }
    return toAdd
  }

  b.changeRoot = (newRoot: any, newParser: any) => {
    root = newRoot
    parser = newParser
    b.root = b(root)
    b.document = b.root
  }

  b.setAll = (elsSpec: ElemListSpec, attr: object) => {
    const els =
      typeof elsSpec === 'string' ? root.querySelectorAll(elsSpec) : elsSpec
    if (!els || !els.length) {
      throw new Error(`Could not find els for setall`, els)
    }
    for (const el of els) {
      b.set(el, attr)
    }
  }

  b.setAttr = (el: any, k: string, v: any) => {
    if (k === 'class' || k === 'classList') {
      b.cls(el, v, true)
      return
    }

    if (parser) {
      if (typeof v === 'function') return

      if (k in el && k != 'id') {
        el[k as keyof typeof el] = v
      } else {
        el.setAttribute(k, v)
      }
      return
    }

    el[k] = v
  }

  b.setObj = (el: HTMLElement, k: string, v: object, bind_to?: any) => {
    const curVal: any = el?.[k as keyof typeof el] ?? undefined
    switch (true) {
      case parser && k === 'style':
        const style = Object.entries(v)
          .map(([k, v]) => {
            k = k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
            return `${k}:${v}`
          })
          .join(';')
        b.setAttr(el, k, style)
      case k === 'on':
        for (let [innerK, innerV] of Object.entries(v)) {
          if (innerK in EVENTS) {
            innerK = innerK.substring(2)
          }
          if (Array.isArray(innerV)) {
            b.on(el, innerK, innerV[0], innerV[1], bind_to)
            continue
          }
          b.on(el, innerK, innerV, null, bind_to)
        }
        return
      case k === 'off':
        for (let [innerK, innerV] of Object.entries(v)) {
          if (innerK in EVENTS) {
            innerK = innerK.substring(2)
          }
          if (Array.isArray(innerV)) {
            b.off(el, innerK)
            continue
          }
          b.off(el, innerK)
        }
        return
      case curVal != undefined && curVal != null && typeof curVal === 'object':
        for (const [innerK, innerV] of Object.entries(v)) {
          if (el.hasOwnProperty(k)) {
            curVal[innerK] = innerV
          }
        }
        return
    }
  }

  b.on = (
    elsSpec: ElemSpec,
    type: string,
    listener: any,
    options?: any,
    bind_to?: any,
  ) => {
    const els = getEls(elsSpec)
    for (const el of els) {
      const event = (e: Event, ...a: any) => {
        debugger
        if (!listener.allowProp) {
          e.preventDefault()
          e.stopPropagation()
        }
        const ret = listener.call(bind_to || el, e, ...a)
        if (ret === 'off') {
          b.off(el, type, listener)
        }
        return ret
      }
      el.addEventListener(type, event, options)
      const anyEl = el as any
      if (typeof anyEl.__events === 'undefined') {
        anyEl.__events = {}
      }
      if (typeof anyEl.__events[type] === 'undefined') {
        anyEl.__events[type] = []
      }
      anyEl.__events[type].push([event, options, listener])
    }
  }

  b.off = (elsSpec: ElemSpec, type: string, listener?: any) => {
    const els = getEls(elsSpec)
    for (const el of els) {
      const anyEl = el as any
      const toRemove = anyEl?.__events?.[type] ?? []
      toRemove
        .filter((remove: any) => !listener || remove[2] == listener)
        .forEach((remove: any) => {
          el.removeEventListener(type, remove[0], remove[1])
        })
    }
  }

  b.set = (el: HTMLElement, attr: object) => {
    if (!attr) {
      return el
    }

    for (const [key, v] of Object.entries(attr)) {
      const k = key === 'class' ? 'classList' : key
      const curVal = el?.[k as keyof typeof el] ?? undefined
      switch (true) {
        case v === null:
          el.removeAttribute(k)
          continue
        case k === 'classList':
          b.setAttr(el, k, v)
          continue
        case typeof v === 'function':
          if (
            k.toLowerCase() in EVENTS &&
            (!curVal || typeof curVal === 'function')
          ) {
            b.on(el, k.substring(2), v, attr)
            continue
          }
          b.setAttr(el, k, v)
          continue
        case Array.isArray(v):
          if (Array.isArray(curVal)) {
            b.setAttr(el, k, v)
            continue
          }
          b.setAttr(el, k, v.join(' '))
          continue
        case Array.isArray(curVal) && typeof v === 'string':
          b.setAttr(el, k, v.split(','))
          continue
        case typeof v === 'object':
          b.setObj(el, k, v, attr)
          continue
      }
      b.setAttr(el, k, v)
    }
    return el
  }

  b.elem = (tag: string, attr: object = {}, ...child: HTMLElement[]) => {
    const el = root.createElement
      ? root.createElement(tag)
      : createRootElement(tag)
    b.set(el, attr)
    b.add('beforeend', el, ...child)
    return el
  }

  b.hasCls = (elsSpec: ElemSpec, ...cls: string[]): boolean => {
    const els = getEls(elsSpec)
    if (!els.length) return false
    for (const el of els) {
      for (const c of cls) {
        if (!el.classList.contains(c)) return false
      }
    }
    return true
  }

  b.addClasses = (elsSpec: ElemSpec, clsSpec?: ClassSpec) => {
    const els = getEls(elsSpec)
    const cls = formatClasses(clsSpec)
    if (!cls) return

    for (const el of els) {
      for (let c of cls) {
        const pred = Array.isArray(c) ? c[1] : true
        const cCls = Array.isArray(c) ? c[0] : c
        if (pred) {
          el.classList.add(cCls as string)
        }
      }
    }
    return els.length === 1 ? els[0] : els
  }

  b.removeClasses = (elsList: ElemSpec, clsSpec?: ClassSpec) => {
    const els = getEls(elsList)
    const cls = formatClasses(clsSpec)
    els.forEach((el: any) => {
      if (!cls) {
        if (el.className) {
          el.className = ''
        } else {
          Array.from(el.classList).forEach((c) => el.classList.remove(c))
        }
        return
      }
      for (let c of cls) {
        const pred = Array.isArray(c) ? c[1] : true
        const cCls = Array.isArray(c) ? c[0] : c
        if (pred) {
          el.classList.remove(cCls)
        }
      }
    })
    return els.length === 1 ? els[0] : els
  }

  function getEls(els: ElemSpec): HTMLElement[] {
    if (typeof els === 'string') {
      els = Array.from(root.querySelectorAll(els))
    }
    if (!Array.isArray(els)) {
      els = [els]
    }
    return els
  }

  function formatClasses(cls: ClassSpec): ClassFormatted {
    if (cls === null || cls === undefined) return cls
    if (typeof cls === 'string') {
      cls = cls
        .split(' ')
        .map((x) => x.trim())
        .filter((x) => x != '')
    }
    const clsArray = !Array.isArray(cls) ? [cls] : cls
    const out = []
    for (const c of clsArray) {
      if (typeof c !== 'object') {
        out.push(c)
        continue
      }
      for (const k of Object.keys(c)) {
        out.push([k, c[k]])
      }
    }
    return out
  }

  b.setClass = (el: HTMLElement, cls: string, doSet: boolean) => {
    if (doSet) {
      if (!el.classList.contains(cls)) {
        el.classList.add(cls)
      }
    } else {
      el.classList.remove(cls)
    }
    return el
  }

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
  b.cls = (
    elsSpec: ElemSpec,
    cls1Spec: ClassSpec,
    cls2Spec?: ClassSpec | Predicate,
    pred?: Predicate | None,
  ) => {
    const els = getEls(elsSpec)

    if (typeof cls2Spec === 'function' || typeof cls2Spec == 'boolean') {
      pred = cls2Spec
      cls2Spec = undefined
    }

    const cls1 = formatClasses(cls1Spec)
    const cls2 = formatClasses(cls2Spec)

    if (!cls1 || !cls1.length) {
      // if no first class passed, remove all classes
      b.removeClasses(els)
      if (cls2 && cls2.length) {
        // if second classes found with no first classes, add all second
        b.addClasses(els, cls2Spec)
      }
      return
    }

    const defaultPredicate = !cls2
      ? (el: any, cls: any) => !el.classList.contains(cls)
      : true

    pred = typeof pred === 'boolean' ? pred : defaultPredicate

    for (const el of els) {
      for (const cls of cls1) {
        const c = Array.isArray(cls) ? cls[0] : cls
        const predVal =
          typeof pred === 'function' ? pred(el, c as string) : pred
        const finPredVal = Array.isArray(cls) ? cls[1] : predVal
        b.setClass(el, c as string, finPredVal as boolean)
      }
      if (!cls2 || !cls2.length) continue

      for (const cls of cls2) {
        const c = Array.isArray(cls) ? cls[0] : cls
        const predVal =
          typeof pred === 'function' ? pred(el, c as string) : !pred
        const finPredVal = Array.isArray(cls) ? cls[1] : predVal
        b.setClass(el, c as string, finPredVal as boolean)
        continue
      }
    }
    return els
  }

  b.allowProp = B.allowProp
  b.root = b(root)
  b.document = b.root
  b.parser = parser
  return b
}

B.isBrowser = isBrowser
B.escape = (unsafe: string) => {
  if (typeof unsafe !== 'string') return unsafe
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

B.allowProp = (func: any) => {
  func.allowProp = true
  return func
}

export default B()
