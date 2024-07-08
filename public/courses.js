import b from '/js/b.js'
import api from '/js/api.js'
import courseWidget from '/widgets/course.js'

export default function OnDOMLoaded() {
  let courses

  async function start() {
    courses = await api.jsonToast('getting courses.', `/courses`)
    if (courses === null) return

    b('#courses-section').build('replace', (el) =>
      courses.map(courseWidget(el)),
    )
  }

  start()
}