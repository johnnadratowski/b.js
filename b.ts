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

const IDProxy = (target: any, ids?: any): any =>
  new Proxy(target, {
    get(t: any, p: string, r: any) {
      ids = ids || { __is_ids: true, classes: [] }
      for (const clss of B.splitClsString(p)) {
        if (clss.startsWith('$') || clss.startsWith('#')) {
          ids.id = clss.substring(1)
        } else {
          ids.classes.push(clss.replace(/^\.+/, ''))
        }
      }
      return IDProxy(t, ids)
    },
    apply: (target, thisArg, argumentsList) => {
      if (ids) {
        return Reflect.apply(target, thisArg, [ids].concat(argumentsList))
      }
      return Reflect.apply(target, thisArg, argumentsList)
    },
  })

type None = undefined | null
type PredicateFunc = (el: HTMLElement, c: string) => boolean
type ElemListSpec = string | HTMLElement[]
type ElemSpec = string | HTMLElement[] | HTMLElement
type ClassSpec =
  | string
  | string[]
  | OB
  | OB[]
  | Reactive
  | Reactive[]
  | { [key: string]: boolean | PredicateFunc }
  | None
type ClassFormatted =
  | (
      | string
      | OB
      | Reactive
      | (
          | OB
          | Reactive
          | string
          | boolean
          | ((el: HTMLElement, c: string) => boolean)
        )[]
    )[]
  | None
type Predicate = boolean | PredicateFunc

const isBrowser = typeof window !== 'undefined'

function getRoot(opts: any): any {
  let root: any
  if (typeof opts.root == 'string') {
    root = opts.parser.parse(opts.root)
  } else if (opts.root) {
    root = opts.root
  }

  if (!root) {
    if (isBrowser) {
      root = window.document
    }
  }
  return root
}

export function B(opts = { root: null, parser: null }): any {
  if (opts.root != null && opts.parser == null) {
    throw new Error('Must pass parser with root doc')
  }
  let parser: any = opts.parser
  let root = getRoot(opts)

  function createRootElement(tag: string) {
    const isVoid =
      root.voidTag && root.voidTag.voidTags && root.voidTag.voidTags.has(tag)
    return parser.parse(isVoid ? `<${tag}/>` : `<${tag}></${tag}>`)
      .childNodes[0]
  }

  function b(parent: any, attrs?: any): any {
    if (!parent) {
      parent = isBrowser
        ? document.body
        : parser.parse('<div id="b-root"></div>')
    }

    if (B.is_b(parent)) {
      return b(parent.el)
    }

    if (typeof parent === 'string') {
      parent = root.querySelector(parent)
    }
    if (!parent) {
      throw new Error(`Could not find el for b`, parent)
    }

    function build(...p: any) {
      let where = 'beforeend'
      if (['beforeend', 'afterbegin', 'replace'].includes(p[0])) {
        where = p.shift()
      }

      if (where === 'replace') {
        parent.innerHTML = ''
        where = 'beforeend'
      }

      let children = getChildren(parent, ...p)

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
      $(q: string, attr: object) {
        return this.querySelector(q, attr)
      },
      $$(q: string, attr: object) {
        return this.querySelectorAll(q, attr)
      },
      querySelector(q: string, attr: object) {
        return b(this.el.querySelector(q), attr)
      },
      querySelectorAll(q: string, attr: object) {
        return Array.from(this.el.querySelectorAll(q)).map((q) => b(q, attr))
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
      let ids
      if (p[0] && typeof p[0] === 'object' && p[0]['__is_ids']) {
        ids = p.shift()
      }
      const isAttrs =
        p.length &&
        p[0] !== null &&
        p[0] !== undefined &&
        !(isBrowser && p[0] instanceof HTMLElement) &&
        !Array.isArray(p[0]) &&
        !OB.is_ob(p[0]) &&
        !Reactive.is_r(p[0]) &&
        typeof p[0] === 'object'

      let attrs: any = {}
      if (isAttrs) {
        attrs = p.shift()
      }
      if (ids) {
        attrs = setClsAndID(attrs, ids)
      }

      const isInnerHTML =
        p.length &&
        p[0] !== null &&
        p[0] !== undefined &&
        !Reactive.is_if(p[0]) &&
        !Reactive.is_for(p[0]) &&
        (typeof p[0] === 'string' || Reactive.is_r(p[0]) || OB.is_ob(p[0]))

      if (isInnerHTML) {
        attrs.innerHTML = p.shift()
      }
      return b.elem(tag, attrs, ...p)
    }
    elems[tag as keyof typeof elems] = IDProxy(tagFunc)
    b[tag as keyof typeof b] = IDProxy(tagFunc)
  }

  b.elems = elems

  b.escape = B.escapeHTML

  class Children {
    parent: any
    children: any[]

    constructor(parent: any) {
      this.parent = parent
      this.children = []
    }

    startIdx(childIdx: any) {
      if (!this.children.length) {
        if (childIdx === 0) {
          return this.parent.children.length
        }
        throw new Error('Getting child start idx before initialization')
      }
      if (childIdx - 1 >= this.children.length) {
        throw new Error('Previous children were not initialized')
      }
      if (childIdx <= this.children.length && this.children[childIdx].length) {
        const idx = Array.from(this.parent.children).indexOf(
          this.children[childIdx][0],
        )
        if (idx > -1) return idx
      }
      const prev = this.getPrev(childIdx)
      if (prev != null) {
        const idx = Array.from(this.parent.children).indexOf(prev.at(-1)) + 1
        if (idx > -1) return idx
      }
      const next = this.getNext(childIdx)
      if (next != null) {
        return Array.from(this.parent.children).indexOf(next[0]) - 1
      }
      return this.parent.children.length
    }

    getPrev(childIdx: any): any {
      if (childIdx == 0) return null
      const prev = this.children[childIdx - 1]
      if (!prev || !prev.length) {
        return this.getPrev(childIdx - 1)
      }
      return prev
    }

    getNext(childIdx: any): any {
      if (childIdx >= this.children.length) return null
      const next = this.children[childIdx + 1]
      if (!next || !next.length) {
        return this.getNext(childIdx + 1)
      }
      return next
    }

    push(children: any) {
      this.children.push(children)
    }

    remove(childIdx: any) {
      if (
        childIdx < this.children.length &&
        this.children[childIdx] &&
        this.children[childIdx].length
      ) {
        for (const toRemove of this.children[childIdx]) {
          toRemove.remove()
        }
        this.children[childIdx] = []
      }
    }

    removeChild(childIdx: any, innerIdx: any) {
      const curChildren = this.children[childIdx]
      const cur = curChildren[innerIdx]
      curChildren.splice(innerIdx, 1)
      cur.remove()
    }

    set(childIdx: any, children: any) {
      this.children[childIdx] = children

      const startIdx = this.startIdx(childIdx)
      const entries = this.children[childIdx].entries()
      for (const [idx, grandChild] of entries) {
        b.insertChildAtIndex(this.parent, grandChild, startIdx + (idx as any))
      }
    }

    setChild(childIdx: any, innerIdx: any, newChild: any) {
      const curChildren = this.children[childIdx]
      const old = curChildren[innerIdx]
      this.parent.replaceChild(newChild, old)
      curChildren[innerIdx] = newChild
    }

    replace(childIdx: any, newChildren: any) {
      this.remove(childIdx)
      this.set(childIdx, newChildren)
    }

    insert(childIdx: any, innerIdx: any, newChildren: any) {
      const curChildren = this.children[childIdx]
      innerIdx = innerIdx ?? curChildren.length
      for (const [idx, child] of newChildren.entries()) {
        b.insertChildAtIndex(this.parent, child, innerIdx + idx)
        curChildren.splice(innerIdx + idx, 0, child)
      }
    }
  }

  function getChildren(parent: HTMLElement, ...children: any) {
    const childData = new Children(parent)
    let out: any[] = []
    for (const [childIdx, child] of children.entries()) {
      const new_ = getChild(parent, childData, childIdx, child)
      childData.push(new_)
      if (!new_) continue

      out = out.concat(new_)
    }
    return out
  }

  function getChild(
    parent: HTMLElement,
    childData: any,
    childIdx: any,
    child: any,
  ) {
    if (!child) return null
    if (Reactive.is_if(child)) {
      const cb = () => {
        childData.remove(childIdx)
        if (!child.call(parent, `child-${childIdx}`)) {
          return
        }

        childData.set(childIdx, _getChild(parent, childData, child, childIdx))
      }

      if (!child.connect(parent, `child-${childIdx}`, cb)) {
        return null
      }
    }
    return _getChild(parent, childData, child, childIdx)
  }

  function _getChild(
    parent: HTMLElement,
    childData: any,
    child: any,
    childIdx: any,
  ) {
    if (Reactive.is_if(child)) child = child.child

    if (Reactive.is_for(child)) {
      const cb = (
        el: any,
        k: any,
        v: any,
        attrs: any,
        ob: any,
        newV: any,
        oldV: any,
        op: any,
        where: any,
        ...args: any[]
      ) => {
        switch (true) {
          case op == 'set' && where !== undefined:
            childData.setChild(childIdx, where, child.forCB(newV))
            return
          case op == 'set':
            childData.replace(
              childIdx,
              newV.map(child.forCB).map(_getChildInner).flat(),
            )
            return
          case op == 'insert':
            childData.insert(
              childIdx,
              where,
              child.forCB(newV).map(_getChildInner),
            )
            return
          case op == 'remove':
            childData.removeChild(where)
            return
          default:
            throw new Error(`Unrecognized reaction operation ${op}`)
        }
      }
      return child
        .connect(parent, `for-${childIdx}`, cb)
        .map(child.forCB)
        .map(_getChildInner)
        .flat()
    }

    return _getChildInner(child)
  }

  function _getChildInner(child: any) {
    let children = typeof child === 'function' ? child(b.elems) : child
    if (children == null || children == undefined) {
      children = []
    }
    if (typeof children === 'string') {
      children = Array.from(b.elems['div']({ innerHTML: children }).children())
    }
    return !Array.isArray(children) ? [children] : children
  }

  b.add = (
    where: InsertPosition,
    el: HTMLElement,
    ...children: (HTMLElement | (() => HTMLElement))[]
  ) => {
    const toAdd = []
    for (const child of getChildren(el, ...children)) {
      if (!child) continue

      if (Array.isArray(child)) {
        toAdd.push(...child.filter((x) => x !== null && x !== undefined))
      } else {
        toAdd.push(child)
      }
    }

    if (toAdd.length) {
      for (const c of toAdd) {
        b.insertAdjacent(el, where, c)
      }
    }
    return toAdd
  }

  b.changeRoot = (newRoot: any, newParser: any) => {
    root = newRoot
    parser = newParser
    b.root = b(root)
    b.document = b.root
    if (b.document.body) {
      b.body = b(b.document.body)
    }
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

  function useReactive(cb: any) {
    return (el: any, k?: any, v?: any, attr?: any) => {
      let r
      if (OB.is_ob(v)) {
        r = new Reactive(v)
      }

      if (r || (r = Reactive.is_r(v))) {
        if (Reactive.is_reactive(r)) {
          return cb(el, k, r.call(el, k, attr))
        }
        return cb(el, k, r.connect(el, k, cb, attr), attr)
      }
      return cb(el, k, v, attr)
    }
  }

  const setAttr = useReactive((el: any, k: string, v: any) => {
    if (k === 'class' || k === 'classList') {
      b.cls(el, null, v, true)
      return
    }
    if (k === 'classAppend') {
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
  })

  const setObjAttr = useReactive((el: any, k: string, v: any, obj: any) => {
    obj[k] = v
  })

  function setObj(el: HTMLElement, k: string, v: object, attr: any) {
    const curVal: any = el?.[k as keyof typeof el] ?? undefined
    switch (true) {
      case parser && k === 'style':
        const style = Object.entries(v)
          .map(([k, v]) => {
            k = k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
            return `${k}:${v}`
          })
          .join(';')
        setAttr(el, k, style, attr)
        return
      case k === 'on':
        for (let [innerK, innerV] of Object.entries(v)) {
          if (EVENTS.includes(innerK.toLowerCase())) {
            innerK = innerK.substring(2)
          }
          if (Array.isArray(innerV)) {
            b.on(el, innerK, innerV[0], innerV[1], attr)
            continue
          }
          b.on(el, innerK, innerV, null, attr)
        }
        return
      case k === 'off':
        for (let [innerK, innerV] of Object.entries(v)) {
          if (EVENTS.includes(innerK.toLowerCase())) {
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
          if (innerK in curVal) {
            setObjAttr(el, innerK, innerV, curVal)
          }
        }
        return
    }
  }

  b.onAll = (
    elsSpec: ElemSpec,
    type: string,
    listener: any,
    options?: any,
    bind_to?: any,
  ) => {
    const els = getEls(elsSpec)
    for (const el of els) {
      b.on(el, type, listener, options, bind_to)
    }
  }

  b.on = useReactive(
    (el: any, type: string, listener: any, options?: any, bind_to?: any) => {
      const event = (e: Event, ...a: any) => {
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
    },
  )

  b.offAll = (elsSpec: any, type: string, listener?: any) => {
    const els = getEls(elsSpec)
    for (const el of els) {
      b.off(el, type, listener)
    }
  }

  b.off = useReactive((el: HTMLElement, type: string, listener?: any) => {
    const anyEl = el as any
    const toRemove = anyEl?.__events?.[type] ?? []
    toRemove
      .filter((remove: any) => !listener || remove[2] == listener)
      .forEach((remove: any) => {
        el.removeEventListener(type, remove[0], remove[1])
      })
  })

  b.set = (el: HTMLElement, attr: object) => {
    if (!attr) {
      return el
    }

    for (const [key, value] of Object.entries(attr)) {
      doSet(el, key, value, attr)
    }
    return el
  }

  const doSet = useReactive((el: HTMLElement, k: any, v: any, attr: any) => {
    const curVal = el?.[k as keyof typeof el] ?? undefined
    switch (true) {
      case k === 'classList' || k === 'classAppend' || k === 'class':
        setAttr(el, k, v, attr)
        return
      case v === null:
        if (EVENTS.includes(k.toLowerCase())) {
          b.off(el, k.substring(2), v)
          return
        }
        el.removeAttribute(k)
        return
      case typeof v === 'function':
        if (EVENTS.includes(k.toLowerCase())) {
          b.on(el, k.substring(2), v, attr)
          return
        }
        setAttr(el, k, v, attr)
        return
      case Array.isArray(v):
        if (Array.isArray(curVal)) {
          setAttr(el, k, v, attr)
          return
        }
        setAttr(el, k, v.join(' '), attr)
        return
      case Array.isArray(curVal) && typeof v === 'string':
        setAttr(el, k, v.split(','), attr)
        return
      case EVENTS.includes(k.toLowerCase()) && v === 'off':
        b.off(el, k.substring(2), v)
      case typeof v === 'object':
        setObj(el, k, v, attr)
        return
    }
    setAttr(el, k, v, attr)
  })

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

  b.addClassesAll = (elsSpec: ElemSpec, clsSpec?: ClassSpec) => {
    const els = getEls(elsSpec)
    for (const el of els) {
      b.addClasses(el, clsSpec)
    }
    return els.length === 1 ? els[0] : els
  }

  b.addClasses = (el: HTMLElement, clsSpec?: ClassSpec) => {
    const cls = formatClasses(clsSpec)
    if (!cls) return

    for (let c of cls) {
      const pred = Array.isArray(c) ? c[1] : true
      const cCls = Array.isArray(c) ? c[0] : c
      if (cCls === undefined || cCls === null) continue
      if (pred) {
        el.classList.add(cCls as string)
      }
    }
    return el
  }

  b.removeClassesAll = (elsList: ElemSpec, clsSpec?: ClassSpec) => {
    const els = getEls(elsList)
    for (const el of els) {
      b.removeClasses(el, clsSpec)
    }
    return els.length === 1 ? els[0] : els
  }

  b.removeClasses = (el: HTMLElement, clsSpec?: ClassSpec) => {
    const cls = formatClasses(clsSpec)
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

  function formatClasses(cls: any): any {
    if (cls === null || cls === undefined) return cls
    if (OB.is_ob(cls) || Reactive.is_r(cls)) {
      throw new Error(
        'Can only use reactives in setting classlist during a `set` operation, or in the main elem',
      )
    }

    if (typeof cls === 'string') {
      cls = B.splitClsString(cls)
    }

    const clsArray = !Array.isArray(cls) ? [cls] : cls
    const out = []
    for (const c of clsArray) {
      if (!c || typeof c !== 'object' || OB.is_ob(c) || Reactive.is_r(c)) {
        out.push(c)
        continue
      }
      for (const k of Object.keys(c)) {
        out.push([k, (c as any)[k]])
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
  b.clsAll = (
    elsSpec: ElemSpec,
    cls1Spec: ClassSpec,
    cls2Spec?: ClassSpec | Predicate,
    pred?: Predicate | None,
  ) => {
    const els = getEls(elsSpec)
    for (const el of els) {
      b.cls(el, cls1Spec, cls2Spec, pred)
    }
    return els
  }

  b.cls = (
    el: HTMLElement,
    cls1Spec: ClassSpec,
    cls2Spec?: ClassSpec | Predicate,
    pred?: Predicate | None,
  ) => {
    const cb = () => {
      const [cls1React, cls2React, predReact] = B.clone(
        [cls1Spec, cls2Spec, pred],
        (v: any) => {
          let r
          if (r || (r = Reactive.is_r(v))) {
            return r.call(el, '')
          }
          return v
        },
      )
      return _cls(el, cls1React, cls2React, predReact, null)
    }

    B.recurseVar(
      [cls1Spec, cls2Spec, pred],
      (v: any, k: any, ...parent: any[]) => {
        let r
        if (OB.is_ob(v)) {
          r = new Reactive(v)
        }

        if (r || (r = Reactive.is_r(v))) {
          if (!Reactive.is_reactive(r)) {
            r.connect(el, k, cb, parent.length ? parent[0][1] : null)
          }
          return true
        }
      },
    )
    return cb()
  }

  function _cls(
    el: HTMLElement,
    cls1Spec: ClassSpec,
    cls2Spec: ClassSpec | Predicate,
    pred: Predicate | None,
    attr?: any,
  ) {
    return _clsInner(el, cls1Spec, 'classList', attr, cls2Spec, pred)
  }

  const _clsInner = (
    el: HTMLElement,
    cls1Spec: any,
    k: any,
    attr: any,
    cls2Spec: any,
    pred: any,
    ...xtra: any[]
  ) => {
    if (typeof cls2Spec === 'function' || typeof cls2Spec == 'boolean') {
      pred = cls2Spec
      cls2Spec = undefined
    }

    const cls1 = formatClasses(cls1Spec)
    const cls2 = formatClasses(cls2Spec)
    if (!cls1 || !cls1.length) {
      // if no first class passed, remove all classes
      b.removeClasses(el)
      if (cls2 && cls2.length) {
        // if second classes found with no first classes, add all second
        b.addClasses(el, cls2Spec)
      }
      return
    }

    const defaultPredicate = !cls2
      ? (el: any, cls: any) => !el.classList.contains(cls)
      : true

    pred = typeof pred === 'boolean' ? pred : defaultPredicate
    for (const cls of cls1) {
      if (cls === undefined || cls === null) continue
      const predVal =
        typeof pred === 'function' ? pred(el, cls as string) : pred

      b.setClass(el, cls as string, predVal as boolean)
    }
    if (!cls2 || !cls2.length) return

    for (const cls of cls2) {
      if (cls === undefined || cls === null) continue
      const predVal =
        typeof pred === 'function' ? pred(el, cls as string) : !pred

      b.setClass(el, cls as string, predVal as boolean)
      continue
    }
  }

  b.B = B
  b.ob = B.ob
  b.r = B.r
  b.if = B.if
  b.for = B.for
  b.isBrowser = B.isBrowser
  b.escapeHTML = B.escapeHTML
  b.splitClsString = B.splitClsString
  b.debounce = B.debounce
  b.throttle = B.throttle
  b.allowProp = B.allowProp
  b.slugify = B.slugify
  b.unslugify = B.unslugify
  b.stripMargin = B.stripMargin
  b.joinMargin = B.joinMargin
  b.titleize = B.titleize
  b.capitalize = B.capitalize
  b.uuid = B.uuid
  b.validateEmail = B.validateEmail
  b.isJSON = B.isJSON
  b.strToBool = B.strToBool
  b.assert = B.assert
  b.assertVal = B.assertVal
  b.isAsync = B.isAsync
  b.asyncUntil = B.asyncUntil
  b.arrayToObj = B.arrayToObj
  b.recurseVar = B.recurseVar
  b.insertChildAtIndex = B.insertChildAtIndex
  b.insertAdjacent = B.insertAdjacent
  b.arrayChunk = B.arrayChunk
  b.root = b(root)
  b.document = b.root
  b.parser = parser
  if (b.document.body) {
    b.body = b(b.document.body)
  }
  return b
}

class Reactive {
  static running: any = null
  __is_r = true
  cb: any
  to: any[] = []
  id: string

  constructor(cb: any) {
    B.assertVal(cb, 'Reactive Callback')
    B.assert(
      OB.is_ob(cb) || !B.isAsync(cb),
      'Cannot use async function in reactive function',
    )
    this.cb = cb
    this.id = B.uuid()
  }

  static is_for(v: any): boolean {
    return v?.__is_for ?? false
  }

  static is_if(v: any): boolean {
    return v?.__is_if ?? false
  }

  static is_r(v: any): Reactive | null {
    return v && v.hasOwnProperty('__is_r') ? (v as Reactive) : null
  }

  static is_reactive(v: any): boolean {
    return v?.__reactive ?? false
  }

  call(el: HTMLElement | OB, k: string, attrs?: any, ...xtra: any[]): any {
    Reactive.running = this
    console.log(`Calling reactive ${this.id} for ${el.id} ${k}`)
    const v = OB.is_ob(this.cb) ? this.cb.value : this.cb(el, k, attrs, ...xtra)
    Reactive.running = null
    return v
  }

  getElTo(el: HTMLElement | OB): any {
    for (const obj of this.to) {
      if (obj.el === el) return obj
    }
    return null
  }

  connect(el: HTMLElement | OB, k: string, cb: any, attrs?: any): any {
    let cur = this.getElTo(el)
    if (!cur) {
      cur = { el, k, attrs, cbs: [] }
      this.to.push(cur)
    }
    console.log(`Connecting ${el.id} ${k} to ${this.id}`)
    if (attrs && k)
      attrs[k] = new Proxy(this, {
        get(target, prop, receiver) {
          if (prop === '__reactive') return true
          // @ts-ignore
          return Reflect.get(...arguments)
        },
      })
    cur.cbs.push(cb)
    return this.call(el, k, attrs)
  }

  react(ob: OB, newV: any, oldV: any, operation: string, ...args: any[]) {
    // TODO: Cleanup removed elements
    // if (!el.isConnected) {
    //   delete this.to[key]
    //   continue
    // }
    for (const { el, k, attrs, cbs } of this.to) {
      for (const cb of cbs) {
        const outVal = this.call(
          el,
          k,
          attrs,
          ob,
          newV,
          oldV,
          operation,
          ...args,
        )
        cb(el, k, outVal, attrs, ob, newV, oldV, operation, ...args)
      }
    }
  }
}

B.r = (cb: any): Reactive => {
  return new Reactive(cb)
}

B.if = (cb: any, child: any): Reactive => {
  return new Proxy(new Reactive(cb), {
    get(target, prop, receiver) {
      if (prop === '__is_if') return true
      if (prop === '__reactive') return true
      if (prop === 'child') return child
      // @ts-ignore
      return Reflect.get(...arguments)
    },
  })
}

B.for = (list: any, forCB: any): Reactive => {
  if (!OB.is_ob(list)) throw new Error('Must pass OB to for method')
  if (!Array.isArray(list.value)) throw new Error('Must pass array value OB')
  return new Proxy(new Reactive(list), {
    get(target, prop, receiver) {
      if (prop === '__is_for') return true
      if (prop === '__reactive') return true
      if (prop === 'forCB') return forCB
      // @ts-ignore
      return Reflect.get(...arguments)
    },
  })
}

class OB {
  __is_ob = true
  _value: any = null
  _id: any = null
  reactives: any = {}
  constructor(value: any) {
    if (Reactive.is_r(value)) {
      this._value = value.connect(this, null, (el: any, k: any, v: any) => {
        this.value = v
      })
      return
    }
    this._value = value
  }

  get id(): any {
    if (this._id == undefined) {
      this._id = B.uuid()
    }
    return this._id
  }
  static is_ob(v: any): OB | null {
    return v && v.hasOwnProperty('__is_ob') ? (v as OB) : null
  }
  _do_react(newV: any, oldV: any, op: any, ...args: any) {
    for (const react of Object.values(this.reactives)) {
      B.any(react).react(this, newV, oldV, op, ...args)
    }
  }
  get value() {
    if (Reactive.running && !this.reactives[Reactive.running.id]) {
      this.reactives[Reactive.running.id] = Reactive.running
    }
    return this._value
  }
  set value(newV: any) {
    if (newV === this.value) return
    const oldV = this.value
    this._value = newV
    this._do_react(newV, oldV, 'set')
  }
  insert(newV: any, where: any) {
    if (this._value == undefined)
      throw new Error('Cannot insert into undefined value')

    if (Array.isArray(this._value)) {
      if (where == undefined) {
        this._value.push(newV)
      } else {
        this._value.splice(where, 0, newV)
      }
      this._do_react(newV, this._value, 'insert', where)
    } else if (typeof this._value === 'object') {
      B.set(this._value, where, newV, false)
      this._do_react(newV, this._value, 'insert', where)
    } else {
      throw new Error(`Cannot insert to object ${this._value}`)
    }
  }
  set(newV: any, where: any) {
    if (this._value == undefined)
      throw new Error('Cannot set on undefined value')

    if (where == undefined) {
      this.value = newV
      return
    }

    if (typeof this._value !== 'object') {
      throw new Error(`Cannot set to object ${this._value}`)
    }

    const oldV = this._value
    B.set(this._value, where, newV)
    this._do_react(newV, oldV, 'set', where)
  }
  remove(newV: any, where: any) {
    if (this._value == undefined)
      throw new Error('Cannot remove from undefined value')

    if (where == undefined) {
      this.value = undefined
      return
    }

    if (typeof this._value !== 'object') {
      throw new Error(`Cannot set to object ${this._value}`)
    }

    const removed = B.remove(this._value, where)
    this._do_react(newV, this._value, 'remove', where, removed)
  }
}

function _splitPathString(path: any) {
  if (typeof path === 'string') {
    path = path.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
    path = path.replace(/^\./, '') // strip a leading dot
    path = path.split('.')
  }
  return path
}

B.remove = (obj: any, path: any) => {
  if (!obj || typeof obj !== 'object') return obj

  path = _splitPathString(path)

  let current = obj

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]

    if (!current[key] || typeof current[key] !== 'object') {
      return null
    }
    current = current[key]
  }

  const finalKey = path[path.length - 1]

  let ret
  if (Array.isArray(current) && !isNaN(finalKey)) {
    ret = current.splice(finalKey, 1)
  } else {
    ret = current[finalKey]
    delete current[finalKey]
  }

  return ret
}

B.set = (obj: any, path: any, value: any, newOnNotExist?: boolean) => {
  if (!obj || typeof obj !== 'object') return obj

  path = _splitPathString(path)

  let current = obj

  for (let i = 0; i < path.length; i++) {
    const key = path[i]

    if (i === path.length - 1) {
      current[key] = value
      break
    }

    if (!current[key] || typeof current[key] !== 'object') {
      if (!newOnNotExist) {
        throw new Error(
          `Cannot set object from path: ${path}.  ${key} does not exist`,
        )
      }
      current[key] = {}
    }
    current = current[key]
  }

  return obj
}

B.ob = (v: any): OB => {
  return new OB(v)
}

B.is_b = (is_b: any) => {
  return is_b && is_b.hasOwnProperty('__is_b')
}

B.isBrowser = isBrowser
B.escapeHTML = (unsafe: string) => {
  if (typeof unsafe !== 'string') return unsafe
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

B.splitClsString = (cls: string): string[] => {
  return cls
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter((x) => x != '')
}

function setClsAndID(attrs: any, ids: any) {
  if (ids.id) {
    if (attrs.id) {
      throw new Error(
        `Object already has an ID ${attrs.id}.  Tried to set to ${ids.id}`,
      )
    }
    attrs.id = ids.id
  }
  if (ids.classes.length) {
    if (!attrs.classAppend) {
      attrs.classAppend = []
    }
    attrs.classAppend = attrs.classAppend.concat(ids.classes)
  }
  return attrs
}

B.debounce = (func: any, timeout = 300) => {
  let timer: any
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

B.throttle = (cb: any, delay = 1000) => {
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

B.isAsync = (fn: any) => {
  return fn.constructor.name === 'AsyncFunction'
}

B.allowProp = (func: any) => {
  func.allowProp = true
  return func
}

B.slugify = (str: string, replace = '-') => {
  return str
    .toString() // Cast to string (optional)
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, replace) // swap any length of whitespace, underscore, hyphen characters with replace
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

B.unslugify = (
  str: string,
  replace: RegExp | string | undefined = undefined,
) => {
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

/**
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * // returns "The Number is:\n    100\nThanks for playing!"
 */
B.stripMargin = (template: string[], ...expressions: any[]) => {
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
B.joinMargin = (template: string[], ...expressions: any[]) => {
  let result = template.reduce((accumulator: any, part: any, i: any) => {
    return accumulator + expressions[i - 1] + part
  })
  return result.replace(/(\n|\r|\r\n)\s*\|/g, '  ')
}

B.titleize = (str: string, splits = /[\s_-]+/) => {
  return str
    .split(splits)
    .map((str) => (str as any).$capitalize())
    .join(' ')
}

B.capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

B.uuid = () => {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) =>
    (
      parseInt(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c) / 4)))
    ).toString(16),
  )
}

B.validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
}

B.isJSON = (str: string) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

B.strToBool = (s: string | number | undefined | null): boolean => {
  if (s == undefined || s == null) return false
  if (typeof s === 'number') {
    return s != 0
  }
  s = s.toLowerCase()
  if (!s.length) return false

  if (s.startsWith('f') || s == '0') return false

  return true
}

class AssertionError extends Error {}
B.assertVal = <T>(
  val: T,
  name: string = 'val',
): asserts val is NonNullable<T> => {
  if (val === undefined || val === null) {
    throw new AssertionError(
      `Expected ${name} to be defined, but received ${val}`,
    )
  }
}

B.assert = (condition: any, msg?: string): asserts condition => {
  if (!condition) {
    throw new AssertionError(msg)
  }
}

B.any = (val: any): any => {
  return val
}

B.asyncUntil = ({ run, until, then, wait = 50 }: any = {}) => {
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

B.arrayToObj = (obj: any, key: string, hasMultiple = false) => {
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

B.recurseVar = (var_: any, cb: any, key?: any, ...parent: any) => {
  if (Array.isArray(var_)) {
    if (cb(var_, key, ...parent)) {
      return
    }
    for (const [i, obj] of var_.entries()) {
      B.recurseVar(obj, cb, i, [key, var_], ...parent)
    }
    return
  }

  if (var_ && typeof var_ === 'object') {
    if (cb(var_, key, ...parent)) {
      return
    }
    for (const k in var_) {
      B.recurseVar(var_[k], cb, k, [key, var_], ...parent)
    }
  }
  if (cb(var_, key)) {
    return
  }
}

B.clone = (obj: any, cb?: any, ...parent: any[]): any => {
  if (cb) {
    obj = cb(obj, ...parent)
  }

  if (obj === undefined || obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => B.clone(item, cb, obj, ...parent))
  }

  const clonedObj: any = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = B.clone(obj[key], cb, obj, ...parent)
    }
  }

  return clonedObj
}

B.insertChildAtIndex = (el: HTMLElement, child: any, index: number) => {
  if (!index) index = 0
  if (index >= el.children.length) {
    el.appendChild(child)
  } else {
    B.insertAdjacent(el.children[index], 'beforebegin', child)
  }
}

B.insertAdjacent = (el: Element, where: InsertPosition, child: any) => {
  if (child instanceof HTMLElement) {
    if (el.insertAdjacentElement) {
      return el.insertAdjacentElement(where, child)
    }
    return el.insertAdjacentHTML(where, child.outerHTML)
  }
  return el.insertAdjacentHTML(where, child)
}

export function* arrayChunk(arr: any[], size: number): any {
  if (size <= 0) throw new Error('Chunk size must be greater than 0')
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
B.arrayChunk = arrayChunk

export default B()
