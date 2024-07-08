import b from '../js/b.js'

let toasts = []

export default function toast(
  msg,
  el = document.body,
  sticky = false,
  time = 5000,
) {
  const out = b(el)
  const where = sticky ? 'afterbegin' : 'beforeend'
  let toast
  out.build(where, ({ div, i }) => {
    const close = div(
      '.close-toast',
      { style: { visibility: sticky ? 'hidden' : 'visible' } },
      [i('.fa .fa-times')],
    )

    toast = div('.toast', [
      i('.toast-warning .fa .fa-triangle-exclamation'),
      div('.toast-message', { textContent: msg }),
      close,
    ])

    if (time && !sticky) {
      setTimeout(() => toast.remove(), time)
    }
    if (!sticky) {
      close.addEventListener('click', () => toast.remove())
    }
    if (!sticky) {
      toasts.push(toast)
      if (toasts.length > 3) {
        toasts[0].remove()
        toasts = toasts.slice(1)
      }
    }
    return toast
  })
  return toast
}