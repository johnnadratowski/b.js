import { getStartOfDate } from '../shared/util.js'

// Opts:
// showDate = true to highlight the selected date
// clickable = true to make the dates clickable
// selected  = the date to be selected
// disablePrevious = disable dates prior to today
// formatDateCell = cb(cell, date, enabled, clickable) called when date cell is created
// dateClick = cb(event, date) called when date cell is clicked
export default function calendar(cal, opts = {}) {
  const monthYear = cal.$('.month-year')
  const dates = cal.$('.dates')
  cal.$('.prev-month', {
    onclick() {
      currentMonth--
      if (currentMonth < 0) {
        currentMonth = 11
        currentYear--
      }
      renderCalendar()
    },
  })
  cal.$('.next-month', {
    onclick() {
      currentMonth++
      if (currentMonth > 11) {
        currentMonth = 0
        currentYear++
      }
      renderCalendar()
    },
  })

  opts.showDate = opts.showDate === undefined ? true : opts.showDate
  opts.clickable = opts.clickable === undefined ? true : opts.clickable
  opts.selected = opts.selected ? opts.selected : new Date()
  let selected = new Date(
    opts.selected.getFullYear(),
    opts.selected.getMonth(),
    opts.selected.getDate(),
  )
  let currentMonth = selected.getMonth()
  let currentYear = selected.getFullYear()

  const today = getStartOfDate()
  function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)

    const monthYearDay = new Intl.DateTimeFormat('en-US', {
      month: 'long',
    }).format(firstDay)
    monthYear.textContent = `${monthYearDay} ${currentYear}`

    dates.build('replace', ({ div }) => {
      const out = []
      for (let i = 0; i < firstDay.getDay(); i++) {
        out.push(div('.date .empty-date'))
      }

      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day)
        const disabled = opts.disablePrevious && date < today
        const is_selected =
          opts.showDate && date.getTime() == selected.getTime()
        const clickable = !disabled && opts.clickable
        const attrs = {
          date,
          classList: {
            disabled,
            selected: is_selected,
            clickable,
          },
        }
        if (clickable) {
          attrs.onclick = (e) => {
            selected = date
            if (opts.dateclick) {
              opts.dateclick(e, date)
            }
            renderCalendar()
          }
        }
        const dateCell = div('.date .has-date', attrs, day)
        if (opts.formatDateCell) {
          opts.formatDateCell(dateCell, date, !disabled, clickable)
        }
        out.push(dateCell)
      }
      return out
    })
  }

  renderCalendar()
}
