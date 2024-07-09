import b from '/b.js'
import calendar from '/widgets/calendar.js'

function start() {
  calendar(b('#example'), {
    dateclick(e, date) {
      alert('Got Date: ' + date)
    },
    disablePrevious: true,
  })
}

export default start
