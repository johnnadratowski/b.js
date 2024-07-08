import api from '../js/api.js'
import calendar from './calendar.js'
import dialog from './dialog.js'
import { dateToISODate } from '../shared/util.js'

function dateclick(onclick) {
  return (e, calDate) => {
    const isExcluded = e.target.classList.contains('excluded')
    const date = dateToISODate(calDate)
    const msg = isExcluded
      ? `Are you sure you want to re-include ${date} for booking?`
      : `Are you sure you want to exclude ${date} from booking?`
    dialog('#exclusion-confirm', {
      submit: 'Yes',
      cancel: 'No',
      body: msg,
      async onsubmit() {
        const resp = await api.jsonToast(
          `${isExcluded ? 'deleting' : 'saving'} exclusion for date ${date}.`,
          `/exclusions`,
          {
            body: { date },
            method: isExcluded ? 'DELETE' : 'POST',
          },
        )
        if (resp) {
          onclick(calDate)
        }
      },
    }).showModal()
  }
}

export default function excludedCalendar(calB, exclusions, selected, onclick) {
  calendar(calB, {
    formatDateCell(cell, date) {
      if (exclusions[dateToISODate(date)]) {
        cell.classList.add('excluded')
      }
    },
    dateclick: onclick ? dateclick(onclick) : null,
    disablePrevious: true,
    showDate: false,
    selected,
  })
}