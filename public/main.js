import b from './b.js'

const navMenuB = b('#nav-menu')
const navMenuButtonB = b('#nav-menu-button', {
  toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    navMenuB.cls('shown')
    navMenuButtonB.cls('rotated')
  },
  onclick(e) {
    this.toggle(e)
    const docClick = (e) => {
      if (e.target && e.target.classList.contains('nav-item')) {
        return
      }
      if (navMenuB.classList.contains('shown')) {
        this.toggle(e)
        document.removeEventListener('click', docClick)
        return
      }
    }
    document.addEventListener('click', docClick)
  },
})