import b from '../js/b.js'
import card from './card.js'

export default function course(el) {
  return (course) =>
    card(el, 'course', course.id, [
      ['Name', course.name],
      ['Username', course.username || b.escape('<NONE>')],
      ['Credit Card', course.masked_credit_card || b.escape('<NONE>')],
    ])
}