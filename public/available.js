import api from '/js/api.js'
import b from '/js/b.js'
import calendar from '/widgets/calendar.js'
import card from '/widgets/card.js'
import dialog from '/widgets/dialog.js'
import spinner from '/widgets/spinner.js'
import toast from '/widgets/toast.js'
import { joinMargin, datetimePretty } from '/shared/util.js'

let calendarDate = new Date()
let courseID = undefined

const courseFilterB = b('#course-filter', {
  onchange(e) {
    courseID = e.target.value
    refresh()
  },
})

calendar(b('#available-calendar'), {
  dateclick(e) {
    calendarDate = e.target.date
    refresh()
  },
  disablePrevious: true,
})

const sectionB = b('#available-section')
b('#available-refresh', {
  async onclick(e) {
    e.preventDefault()
    const out = await spinner(
      async () =>
        await api.jsonToast(
          'refreshing available reservations.',
          `/reservations/refresh`,
          {
            params: {
              date: calendarDate.toLocaleDateString(),
              course: courseID,
            },
          },
        ),
    )
    if (out !== null) {
      refresh()
    }
  },
})

async function bookTimeClick(e) {
  const card = e.target.closest('.card')
  e.preventDefault()
  const date = datetimePretty(card.obj.reservation.date, false)
  let holes = card.obj.reservation.holes
  if (holes !== '9') {
    holes = '18'
  }
  const sideAndHoles =
    holes == '9' ? `${card.obj.reservation.side_name} ${holes}` : '18 holes'
  dialog('#book-time', {
    submit: 'Yes',
    cancel: 'No',
    body: joinMargin`
    |Are you sure you want to book
    |<span class="callout">${card.obj.course.name}</span>
    |<span class="callout">${sideAndHoles}</span>
    |for <span class="callout">${card.obj.reservation.available_spots}</span> @ 
    |<span class="callout">${date}</span>?`,
    async onsubmit() {
      const out = await api.jsonToast(
        'booking the reservation.  Reservation was not booked',
        `/reservations/${card.obj.id}/book`,
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

let available
async function refresh() {
  const date = calendarDate || new Date()

  available = await api.jsonToast(
    'getting available reservations.',
    `/reservations/available`,
    { params: { date: date.toLocaleDateString(), course: courseID } },
  )
  if (available === null) return

  sectionB.build(
    'replace',
    (el) =>
      available.map((available) => {
        const course = courses[available.course]
        if (!course) {
          toast(`Could not find course with id ${available.course}`, '#toasts')
          return
        }
        return card(
          el,
          'available',
          { id: available.id, reservation: available, course },
          [
            ['Course', course.name],
            ['Time', datetimePretty(available.date, false)],
            ['Spots', available.available_spots],
            ['Side', available.side_name],
            ['Holes', available.holes],
            ['Green Fee', available.green_fee],
          ],
          el.div('.card-button', { onclick: bookTimeClick }, 'Book Time'),
        )
      }),
    `No Available Times Found on ${date.toLocaleDateString()}`,
  )
}

let courses
async function start() {
  courses = await api.jsonToast('getting courses.', `/courses`, {
    params: { keyed: 'id' },
  })
  if (courses === null) return

  courseFilterB.innerHTML = ''
  courseFilterB.buildSelectOptions(
    [undefined, 'All'],
    ...Object.keys(courses).map((key) => [courses[key].id, courses[key].name]),
  )

  refresh()
}

start()