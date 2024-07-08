export default function toolTip(el, text) {
  let tooltip = el.querySelector('.tooltip')
  if (!tooltip) {
    tooltip = document.createElement('span')
    tooltip.classList.add('tooltip')
    tooltip.textContent = text
    el.appendChild(tooltip)

    el.addEventListener('mouseover', () => {
      tooltip.classList.add('visible')
    })
    el.addEventListener('mouseout', () => {
      tooltip.classList.remove('visible')
    })
    el.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 25 + 'px'
      tooltip.style.top = e.clientY + 'px'
    })
  }
}
