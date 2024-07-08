import b from './js/b.js'
import api from './js/api.js'
import spinner from './widgets/spinner.js'
import booking from './widgets/booking.js'
import dialog from './widgets/dialog.js'

async function cancelTimeClick(e) {
  const card = e.target.closest('.card')
  e.preventDefault()
  dialog('#cancel-time', {
    submit: 'Yes',
    cancel: 'No',
    async onsubmit() {
      const out = await api.jsonToast(
        'cancelling booking.  Booking was not cancelled.',
        `/bookings/${card.obj.id}/cancel`,
        {
          method: 'POST',
        },
      )
      if (out) {
        card.remove()
      }
    },
  }).showModal()
}

export default function OnDOMLoaded() {
  let doDelete = false
  let future, past, courses
  const futureSectionB = b('#bookings-future-section')
  const pastSectionB = b('#bookings-past-section')
  const bookingsRefreshB = b('#bookings-refresh', {
    async onclick(e) {
      e.preventDefault()
      await spinner(
        async () =>
          await api.jsonToast('refreshing bookings.', `/bookings/refresh`, {
            params: { doDelete },
          }),
      )
      refresh()
    },
  })

  b(document, {
    onkeydown(e) {
      doDelete = e.metaKey
      bookingsRefreshB.cls('fa-trash', 'fa-refresh', doDelete)
    },
    onkeyup() {
      doDelete = false
      bookingsRefreshB.cls('fa-refresh', 'fa-trash', true)
    },
  })

  async function refresh() {
    courses = await api.jsonToast('getting courses.', `/courses`, {
      params: { keyed: 'id' },
    })
    if (courses === null) return

    future = await api.jsonToast('getting future bookings.', `/bookings/future`)
    if (future === null) return

    past = await api.jsonToast('getting past bookings.', `/bookings/past`)
    if (past === null) return

    futureSectionB.build(
      'replace',
      (el) => future.map(booking(courses, el, cancelTimeClick)),
      'No Future Bookings Found',
    )

    pastSectionB.build(
      'replace',
      (el) => past.map(booking(courses, el)),
      'No Past Bookings Found',
    )
  }

  refresh()
}