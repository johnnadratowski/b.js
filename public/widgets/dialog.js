import b from '../js/b.js'

export default function dialog(el, opt) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }
  if (el instanceof HTMLElement) {
    el = b(el)
  }
  if (!el) {
    throw new Error('Couldnt find dialog')
  }

  if (opt.title) {
    el.childB('.dialog-title-text', opt.title)
  }

  if (opt.body) {
    el.childB('.dialog-content', opt.body)
  }

  if (opt.submit) {
    el.childB('.submit-button', opt.submit)
  }
  if (opt.submitDisabled) {
    el.childB('.submit-button', { disabled: true })
  }
  if (opt.cancel) {
    el.childB('.cancel-button', opt.cancel)
  }

  const submit = el.childB(`.submit-button`)
  submit.onclick = async (e) => {
    e.preventDefault()
    if (!(await opt.onsubmit(e))) {
      el.close()
    }
  }

  const cancel = el.childB(`.cancel-button`)
  if (opt.hideCancel) {
    cancel.style.visibility = 'hidden'
  }
  cancel.onclick = (e) => {
    e.preventDefault()
    el.returnValue = null
    if (opt.onclose) {
      opt.onclose(e)
    }

    el.close()
  }

  return el
}