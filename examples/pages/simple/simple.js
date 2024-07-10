import b from '/b.js'

let name = 'UNKNOWN'
b.body.build(({ div, h1, button }) =>
  div(
    '#main',
    h1('#header', `Hello ${name}!`),
    button(
      '#button',
      {
        onclick() {
          name = prompt('Enter Name: ')
          b('#header', `Hello ${name}!`)
        },
        style: { marginBottom: '12px' },
      },
      'Set Name',
    ),
    div(
      '#content',
      { style: { color: 'red' } },
      'Your Content Goes Here',
      div('#section', { style: { color: 'blue' } }, 'Your Section Goes Here'),
    ),
  ),
)
