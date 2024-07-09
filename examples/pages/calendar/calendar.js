import b from './b.js'
import calendar from '/widgets/calendar.js'
let calendarDate = new Date()

calendar(b('#example-calendar'), {
  dateclick(e) {
    calendarDate = e.target.date
    refresh()
  },
  disablePrevious: true,
})