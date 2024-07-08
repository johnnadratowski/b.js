import b from '/js/b.js'

export default async function spinner(cb) {
  const html = b('html', { style: { cursor: 'wait' } })
  const out = b('body').build(({ div }) => div('.overlay', div('.spinner')))
  const stop = () => {
    html.style.cursor = 'default'
    out.removeChildren()
  }
  if (cb) {
    const ret = await cb()
    stop()
    return ret
  }
  return stop
}
