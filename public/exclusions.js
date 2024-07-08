import b from './js/b.js'
import api from './js/api.js'
import excludedCalendar from './widgets/excluded-calendar.js'

export default function OnDOMLoaded() {
  let exclusions
  async function refresh(selected) {
    exclusions = await api.jsonToast('getting exclusions.', `/exclusions`, {
      params: { keyed: 'date' },
    })
    if (exclusions === null) return

    excludedCalendar(b('#excluded-calendar'), exclusions, selected, refresh)
  }

  refresh()
}