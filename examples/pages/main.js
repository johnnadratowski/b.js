import b from './b.js'

const navMenuB = b('#nav-menu')
const navMenuButtonB = b('#nav-menu-button', {
  _toggle() {
    navMenuB.cls('shown')
    navMenuButtonB.cls('rotated')
  },
  onclick() {
    this._toggle()
    b.document.on('click', (e) => {
      if (
        (e.target && b(e.target).hasCls('nav-item')) ||
        !navMenuB.hasCls('shown')
      )
        return
      this._toggle()
      return 'off'
    })
  },
})