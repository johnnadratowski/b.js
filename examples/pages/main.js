import b from './b.js'

const navMenuB = b('#nav-menu')
const navMenuButtonB = b('#nav-menu-button', {
  _toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    navMenuB.cls('shown')
    navMenuButtonB.cls('rotated')
  },
  onclick(e) {
    this._toggle(e)
    b.root.on('click', (e) => {
      if (e.target && b(e.target).hasCls('nav-item')) {
        return
      }
      if (!navMenuB.hasCls('shown')) return
      this._toggle(e)
      b.root.off('click')
    })
  },
})