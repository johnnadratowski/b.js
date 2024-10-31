import b from '/b.js'

let name = b.ob('hi')
let disableClick = b.ob(b.r(() => !!name.value))
let nameChildren = b.ob(b.r(() => (name.value ?? '').split('')))

b.body.build(({ div, h1, button, ol, li }) =>
  div.$main(
    button.$button.button(
      {
        onclick: b.r(() =>
          disableClick.value
            ? null
            : () => {
                name.value = prompt('Enter Name: ')
              },
        ),
        class: {
          disabled: disableClick,
        },
        disabled: disableClick,
        style: {
          color: b.r(() => (disableClick.value ? 'red' : 'black')),
        },
      },
      b.r(() => `Set Name${name.value ? ', ' + b.capitalize(name.value) : ''}`),
    ),
    button['#reset-button .button foo ...bar'](
      {
        onclick() {
          name.value = ''
        },
      },
      'Reset',
    ),
    b.if(disableClick, h1.$header(name)),
    b.if(name, ol(b.for(nameChildren, (x) => li(x)))),
  ),
)
