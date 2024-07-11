import b from '/b.js'

let name = b.ob('')
b.body.build(({ div, h1, button }) =>
  div(
    '#main',
    button(
      '#button',
      {
        onclick() {
          name.value = prompt('Enter Name: ')
        },
      },
      // name.as((v) => `Set Name${v ? ', ' + b.capitalize(v) : ''}`),
    ),
    h1(
      '#header',
      {
        style: {
          display: name.as((v) => (v && v !== 'UNKNOWN' ? 'block' : 'none')),
        },
      },
      name.as('Hello ${}!'),
    ),
    // div(
    //   '#content',
    //   { style: { color: 'red' } },
    //   'Your Content Goes Here',
    //   div('#section', { style: { color: 'blue' } }, 'Your Section Goes Here'),
    // ),
  ),
)
