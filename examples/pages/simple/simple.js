import b from '/b.js'

let name = b.ob('')

let disableClick = b.ob(false)
b.body.build(({ div, h1, button }) =>
  div(
    '#main',
    button(
      '#button',
      {
        onclick: b.r(() =>
          disableClick.value
            ? null
            : () => {
                name.value = prompt('Enter Name: ')
                disableClick.value = true
              },
        ),
      },
      b.r(() => `Set Name${name.value ? ', ' + b.capitalize(name.value) : ''}`),
    ),
    h1(
      '#header',
      {
        style: {
          display: b.r(() =>
            name.value && name.value !== 'UNKNOWN' ? 'block' : 'none',
          ),
        },
      },
      name,
    ),
    // div(
    //   '#content',
    //   { style: { color: 'red' } },
    //   'Your Content Goes Here',
    //   div('#section', { style: { color: 'blue' } }, 'Your Section Goes Here'),
    // ),
  ),
)
