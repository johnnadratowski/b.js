import toast from './toast.js'
import card from './card.js'
import { datetimePretty } from '../shared/util.js'

export default function booking(courses, el, cancelTimeClick) {
  return (booking) => {
    const course = courses[booking.course]
    if (!course) {
      toast(`Could not find course with id ${booking.course}`, '#toasts')
      return null
    }
    return card(
      el,
      'booking',
      { id: booking.id, booking },
      [
        ['Course', course.name],
        ['Time', datetimePretty(booking.date, false)],
        ['Players', booking.players],
        ['Side', booking.side_name],
        ['Holes', booking.holes],
      ],
      cancelTimeClick
        ? el.div('.card-button', { onclick: cancelTimeClick }, 'Cancel Time')
        : null,
    )
  }
}